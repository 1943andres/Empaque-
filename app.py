from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
import json
import openai
from flask_cors import CORS
from config import Config

app = Flask(__name__)

# Cargar configuración
app.config.from_object(Config)

# Validar configuración crítica
try:
    Config.validate_config()
    print("✅ Configuración validada correctamente")
except ValueError as e:
    print(f"❌ Error de configuración: {e}")
    print("Por favor, copia .env.example a .env y configura tu OPENAI_API_KEY")
    exit(1)

# Configurar OpenAI
openai.api_key = Config.OPENAI_API_KEY

# Crear directorio de uploads si no existe
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Inicializar extensiones
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Modelos de base de datos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='cliente')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PQR(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pqr_type = db.Column(db.String(50), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), nullable=False, default='media')
    status = db.Column(db.String(20), nullable=False, default='abierta')
    client_name = db.Column(db.String(100), nullable=False)
    client_email = db.Column(db.String(120), nullable=False)
    client_phone = db.Column(db.String(20))
    preferred_contact_method = db.Column(db.String(20), default='email')
    product_name = db.Column(db.String(100))
    batch_number = db.Column(db.String(50))
    reception_date = db.Column(db.Date)
    ideal_temperature_range = db.Column(db.String(50))
    assigned_agent_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    resolution_date = db.Column(db.Date)
    other_documents_urls = db.Column(db.Text)  # JSON string of file URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    assigned_agent = db.relationship('User', backref='assigned_pqrs')

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pqr_id = db.Column(db.Integer, db.ForeignKey('pqr.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    pqr = db.relationship('PQR', backref='comments')
    author = db.relationship('User', backref='comments')

# Rutas de autenticación
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        })
    
    return jsonify({'error': 'Credenciales inválidas'}), 401

@app.route('/api/current_user', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        })
    return jsonify({'error': 'Usuario no encontrado'}), 404

# Rutas de PQRs
@app.route('/api/pqrs', methods=['GET'])
@jwt_required()
def get_pqrs():
    search = request.args.get('search', '')
    query = PQR.query
    
    if search:
        query = query.filter(
            db.or_(
                PQR.subject.contains(search),
                PQR.client_name.contains(search),
                PQR.id.like(f'%{search}%')
            )
        )
    
    pqrs = query.order_by(PQR.created_at.desc()).all()
    
    result = []
    for pqr in pqrs:
        result.append({
            'id': pqr.id,
            'pqr_type': pqr.pqr_type,
            'subject': pqr.subject,
            'description': pqr.description,
            'priority': pqr.priority,
            'status': pqr.status,
            'client_name': pqr.client_name,
            'client_email': pqr.client_email,
            'assigned_agent_name': pqr.assigned_agent.name if pqr.assigned_agent else None,
            'created_at': pqr.created_at.isoformat()
        })
    
    return jsonify(result)

@app.route('/api/pqrs', methods=['POST'])
@jwt_required()
def create_pqr():
    data = json.loads(request.form.get('data'))
    
    # Crear nueva PQR
    pqr = PQR(
        pqr_type=data.get('pqr_type'),
        subject=data.get('subject'),
        description=data.get('description'),
        priority=data.get('priority', 'media'),
        client_name=data.get('client_name'),
        client_email=data.get('client_email'),
        client_phone=data.get('client_phone'),
        preferred_contact_method=data.get('preferred_contact_method', 'email'),
        product_name=data.get('product_name'),
        batch_number=data.get('batch_number'),
        reception_date=datetime.strptime(data.get('reception_date'), '%Y-%m-%d').date() if data.get('reception_date') else None,
        ideal_temperature_range=data.get('ideal_temperature_range')
    )
    
    # Manejar archivos subidos
    files = request.files.getlist('files')
    file_urls = []
    for file in files:
        if file and file.filename:
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            file_urls.append(f"uploads/{filename}")
    
    if file_urls:
        pqr.other_documents_urls = json.dumps(file_urls)
    
    db.session.add(pqr)
    db.session.commit()
    
    return jsonify({
        'message': 'PQR creada exitosamente',
        'pqr': {
            'id': pqr.id,
            'subject': pqr.subject,
            'status': pqr.status
        }
    }), 201

@app.route('/api/pqrs/<int:pqr_id>', methods=['GET'])
@jwt_required()
def get_pqr(pqr_id):
    pqr = PQR.query.get_or_404(pqr_id)
    
    return jsonify({
        'id': pqr.id,
        'pqr_type': pqr.pqr_type,
        'subject': pqr.subject,
        'description': pqr.description,
        'priority': pqr.priority,
        'status': pqr.status,
        'client_name': pqr.client_name,
        'client_email': pqr.client_email,
        'client_phone': pqr.client_phone,
        'preferred_contact_method': pqr.preferred_contact_method,
        'product_name': pqr.product_name,
        'batch_number': pqr.batch_number,
        'reception_date': pqr.reception_date.isoformat() if pqr.reception_date else None,
        'ideal_temperature_range': pqr.ideal_temperature_range,
        'assigned_agent_id': pqr.assigned_agent_id,
        'resolution_date': pqr.resolution_date.isoformat() if pqr.resolution_date else None,
        'other_documents_urls': json.loads(pqr.other_documents_urls) if pqr.other_documents_urls else [],
        'created_at': pqr.created_at.isoformat()
    })

@app.route('/api/pqrs/<int:pqr_id>', methods=['PUT'])
@jwt_required()
def update_pqr(pqr_id):
    pqr = PQR.query.get_or_404(pqr_id)
    data = json.loads(request.form.get('data'))
    
    # Actualizar campos
    pqr.status = data.get('status', pqr.status)
    pqr.assigned_agent_id = data.get('assigned_agent_id') if data.get('assigned_agent_id') else None
    pqr.resolution_date = datetime.strptime(data.get('resolution_date'), '%Y-%m-%d').date() if data.get('resolution_date') else None
    pqr.updated_at = datetime.utcnow()
    
    # Manejar nuevos archivos
    files = request.files.getlist('files')
    if files and files[0].filename:  # Si hay archivos nuevos
        existing_urls = json.loads(pqr.other_documents_urls) if pqr.other_documents_urls else []
        
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                filename = timestamp + filename
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                existing_urls.append(f"uploads/{filename}")
        
        pqr.other_documents_urls = json.dumps(existing_urls)
    
    db.session.commit()
    
    return jsonify({'message': 'PQR actualizada exitosamente'})

@app.route('/api/pqrs/<int:pqr_id>', methods=['DELETE'])
@jwt_required()
def delete_pqr(pqr_id):
    pqr = PQR.query.get_or_404(pqr_id)
    
    # Eliminar comentarios asociados
    Comment.query.filter_by(pqr_id=pqr_id).delete()
    
    # Eliminar archivos físicos
    if pqr.other_documents_urls:
        file_urls = json.loads(pqr.other_documents_urls)
        for url in file_urls:
            file_path = os.path.join(app.root_path, url)
            if os.path.exists(file_path):
                os.remove(file_path)
    
    db.session.delete(pqr)
    db.session.commit()
    
    return jsonify({'message': 'PQR eliminada exitosamente'})

# Rutas de comentarios
@app.route('/api/pqrs/<int:pqr_id>/comments', methods=['GET'])
@jwt_required()
def get_pqr_comments(pqr_id):
    comments = Comment.query.filter_by(pqr_id=pqr_id).order_by(Comment.created_at.asc()).all()
    
    result = []
    for comment in comments:
        result.append({
            'id': comment.id,
            'comment': comment.comment,
            'author_name': comment.author.name,
            'created_at': comment.created_at.isoformat()
        })
    
    return jsonify(result)

@app.route('/api/pqrs/<int:pqr_id>/comments', methods=['POST'])
@jwt_required()
def add_pqr_comment(pqr_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    comment = Comment(
        pqr_id=pqr_id,
        author_id=user_id,
        comment=data.get('comment')
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({'message': 'Comentario añadido exitosamente'}), 201

# Rutas de usuarios
@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    role_filter = request.args.get('role')
    query = User.query
    
    if role_filter:
        query = query.filter_by(role=role_filter)
    
    users = query.all()
    
    result = []
    for user in users:
        result.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        })
    
    return jsonify(result)

@app.route('/api/users', methods=['POST'])
@jwt_required()
def create_user():
    data = request.get_json()
    
    # Verificar si el email ya existe
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'El email ya está registrado'}), 400
    
    user = User(
        name=data.get('name'),
        email=data.get('email'),
        password_hash=generate_password_hash(data.get('password')),
        role=data.get('role', 'cliente')
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'Usuario creado exitosamente'}), 201

@app.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role
    })

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    user.role = data.get('role', user.role)
    
    if data.get('password'):
        user.password_hash = generate_password_hash(data.get('password'))
    
    db.session.commit()
    
    return jsonify({'message': 'Usuario actualizado exitosamente'})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    
    # No permitir eliminar el último administrador
    if user.role == 'administrador':
        admin_count = User.query.filter_by(role='administrador').count()
        if admin_count <= 1:
            return jsonify({'error': 'No se puede eliminar el último administrador'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'Usuario eliminado exitosamente'})

# Ruta de estadísticas
@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    total_pqrs = PQR.query.count()
    open_pqrs = PQR.query.filter_by(status='abierta').count()
    in_process_pqrs = PQR.query.filter_by(status='en_proceso').count()
    resolved_pqrs = PQR.query.filter_by(status='resuelta').count()
    
    # Estadísticas por tipo
    type_stats = db.session.query(PQR.pqr_type, db.func.count(PQR.id)).group_by(PQR.pqr_type).all()
    type_labels = [stat[0] for stat in type_stats]
    type_data = [stat[1] for stat in type_stats]
    
    # Estadísticas por agente
    agent_stats = db.session.query(User.name, db.func.count(PQR.id)).join(PQR, User.id == PQR.assigned_agent_id).group_by(User.name).all()
    agent_labels = [stat[0] for stat in agent_stats]
    agent_data = [stat[1] for stat in agent_stats]
    
    return jsonify({
        'total_pqrs': total_pqrs,
        'open_pqrs': open_pqrs,
        'in_process_pqrs': in_process_pqrs,
        'resolved_pqrs': resolved_pqrs,
        'pqr_type_data': {
            'labels': type_labels,
            'data': type_data
        },
        'pqr_agent_data': {
            'labels': agent_labels,
            'data': agent_data
        }
    })

# Ruta del asistente de IA con OpenAI
@app.route('/api/ai_chat', methods=['POST'])
@jwt_required()
def ai_chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'Mensaje vacío'}), 400
        
        # Contexto específico para Alimentos Enriko
        system_context = """
        Eres un asistente de IA especializado en el sistema PQR (Peticiones, Quejas y Reclamos) de Alimentos Enriko.
        
        Tu función es ayudar a los usuarios con:
        - Información sobre productos lácteos (leche, yogurt, quesos, etc.)
        - Procedimientos de calidad y trazabilidad
        - Rangos de temperatura ideales para productos lácteos
        - Guía sobre cómo completar formularios PQR
        - Información sobre el proceso de gestión de PQRs
        - Mejores prácticas para el manejo de alimentos
        
        Información clave sobre Alimentos Enriko:
        - Es una empresa especializada en productos lácteos
        - Maneja estrictos controles de calidad
        - Los productos requieren cadena de frío (generalmente 2°C - 8°C)
        - Se enfocan en la trazabilidad completa de sus productos
        
        Responde de manera profesional, útil y específica al contexto de la industria alimentaria.
        Si no tienes información específica, sugiere contactar con el departamento de calidad.
        """
        
        # Llamada a OpenAI API
        response = openai.ChatCompletion.create(
            model=Config.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_context},
                {"role": "user", "content": user_message}
            ],
            max_tokens=Config.OPENAI_MAX_TOKENS,
            temperature=Config.OPENAI_TEMPERATURE
        )
        
        ai_reply = response.choices[0].message.content.strip()
        
        return jsonify({'reply': ai_reply})
        
    except openai.error.AuthenticationError:
        return jsonify({'error': 'Error de autenticación con OpenAI. Verifica tu API key.'}), 500
    except openai.error.RateLimitError:
        return jsonify({'error': 'Límite de solicitudes excedido. Intenta más tarde.'}), 429
    except openai.error.APIError as e:
        return jsonify({'error': f'Error de API de OpenAI: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

# Servir archivos estáticos
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Inicializar base de datos y datos de prueba
def init_db():
    with app.app_context():
        db.create_all()
        
        # Crear usuario administrador por defecto si no existe
        if not User.query.filter_by(email='admin@alimentos-enriko.com').first():
            admin = User(
                name='Administrador',
                email='admin@alimentos-enriko.com',
                password_hash=generate_password_hash('admin123'),
                role='administrador'
            )
            db.session.add(admin)
        
        # Crear algunos usuarios de prueba
        test_users = [
            ('Juan Pérez', 'juan.perez@alimentos-enriko.com', 'calidad123', 'calidad'),
            ('María González', 'maria.gonzalez@alimentos-enriko.com', 'registro123', 'registrador'),
            ('Cliente Prueba', 'cliente@email.com', 'cliente123', 'cliente')
        ]
        
        for name, email, password, role in test_users:
            if not User.query.filter_by(email=email).first():
                user = User(
                    name=name,
                    email=email,
                    password_hash=generate_password_hash(password),
                    role=role
                )
                db.session.add(user)
        
        db.session.commit()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)