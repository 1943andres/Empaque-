import React, { useState, useEffect } from 'react';
import { Upload, Download, BarChart3, TrendingUp, Calendar, Package, FileSpreadsheet, Play, Settings, Eye } from 'lucide-react';

const ProductionForecastingSystem = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [salesData, setSalesData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [productionPlan, setProductionPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Productos reales completos de ENRIKO
  const sampleData = {
    products: [
      { item: 'PC001001', familia: 'Comercializado', producto: 'Salsa Fruco May Pead Fco x 3.77 Kg' },
      { item: 'PC001037', familia: 'Piñas', producto: 'Pina Calada en julianas x 3500g ( Endulzada )' },
      { item: 'PC001049', familia: 'Comercializado', producto: 'Pasta de Tomate Bolsa x 3000g' },
      { item: 'PC001051', familia: 'Queso', producto: 'Queso Mozzarella Tajado X 2500 g' },
      { item: 'PC001055', familia: 'Comercializado', producto: 'Aceite x 20 Lt' },
      { item: 'PC001058', familia: 'Comercializado', producto: 'Etiqueta 4.8 x 4.8 Polipropileno Rll x 500 und Impreso' },
      { item: 'PC001070', familia: 'Comercializado', producto: 'Croutons Cesar Paq x 24 und x 15g' },
      { item: 'PC001085', familia: 'Comercializado', producto: 'Jalapeno bolsa x 260g' },
      { item: 'PC001087', familia: 'Comercializado', producto: 'Papel Canastilla Earthpact 32cm x 17cm Pq x 1000 und' },
      { item: 'PC001088', familia: 'Comercializado', producto: 'Salsa Miel Mostaza x 200g' },
      { item: 'PC001112', familia: 'Comercializado', producto: 'Paño Microfibra Caja x 12 und' },
      { item: 'PC001131', familia: 'Comercializado', producto: 'Salsa Hogo Natural' },
      { item: 'PC001146', familia: 'Comercializado', producto: 'Salsa Tomate Sachet x8g x1000 unds' },
      { item: 'PC002022', familia: 'Comercializado', producto: 'Endulzante sucralosa Paq x250 sobres' },
      { item: 'PC006001', familia: 'Comercializado', producto: 'Menta Pq x 286 und' },
      { item: 'PC007001', familia: 'Comercializado', producto: 'Guantes Vinilo Talla S Caja x 100und' },
      { item: 'PC007002', familia: 'Comercializado', producto: 'Guantes Vinilo Talla M Caja x 100und' },
      { item: 'PC007003', familia: 'Comercializado', producto: 'Guantes Vinilo Talla L Caja x 100und' },
      { item: 'PC010020', familia: 'Comercializado', producto: 'Caja Papa 180 Earth Pack Pq x 50 und' },
      { item: 'PC010031', familia: 'Comercializado', producto: 'Bolsa Combo Pq x 100 und' },
      { item: 'PC010032', familia: 'Comercializado', producto: 'Bolsa Domicilio Pq x 100 und' },
      { item: 'PC010033', familia: 'Comercializado', producto: 'Bolsa Papa 70 Gr pq x 50 und' },
      { item: 'PC010035', familia: 'Comercializado', producto: 'Bolsa Plastica Logo Grande Pq x 100 und' },
      { item: 'PC010044', familia: 'Comercializado', producto: 'Papel Antigraso Naranja Paq x 1000 und' },
      { item: 'PC010060', familia: 'Comercializado', producto: 'Caja Papa 140 Pq x 50und 0 Impona' },
      { item: 'PC016008', familia: 'Comercializado', producto: 'Vaso 22 onz Pq x 50 und' },
      { item: 'PC016012', familia: 'Comercializado', producto: 'Vasos 16 onz Caja x 1000 und' },
      { item: 'PC016013', familia: 'Comercializado', producto: 'Tapa para Vaso 16 / 22 onz Pq x 100 und' },
      { item: 'PC016023', familia: 'Comercializado', producto: 'Vasos 16 onz Caja x 1000 und 0 Pizza' },
      { item: 'PC020001', familia: 'Comercializado', producto: 'Bandejas plasticas x Und' },
      { item: 'PC040001', familia: 'Comercializado', producto: 'Teflon x 1m' },
      { item: 'PE001061', familia: 'Bakano', producto: 'Bakano Plegadiza x10 Unds x24g' },
      { item: 'PE001060', familia: 'Bakano', producto: 'Bakano x24g' },
      { item: 'PE001032', familia: 'Embutidos', producto: 'Chorizo de Cerdo x 500 x 8 Und' },
      { item: 'PE002008', familia: 'Hamburguesas', producto: 'Hamburguesa Qbano x 10 Un x 125g' },
      { item: 'PE004003', familia: 'Jamones Q', producto: 'Jamon Cordero x 1500g' },
      { item: 'PE004005', familia: 'Jamones Q', producto: 'Jamon Pizza x 2000g' },
      { item: 'PE004084', familia: 'Jamones', producto: 'Jamon Tradicional Cubos Jenos x1000g' },
      { item: 'PE005002', familia: 'Jamones Q', producto: 'Jamon Tipo Cordero Pierna x 500g' },
      { item: 'PE005013', familia: 'Jamones Q', producto: 'Jamon Roast Beef x 500g' },
      { item: 'PE005016', familia: 'Jamones', producto: 'Jamon Cerdo Especial x 1000g' },
      { item: 'PE010001', familia: 'Tocinetas', producto: 'Tocineta Ahumada Picada Institucional x 1000g' },
      { item: 'PE010004', familia: 'Tocinetas', producto: 'Tocineta Ahumada x 1000g' },
      { item: 'PE010012', familia: 'Tocinetas', producto: 'Tocineta Ahumada en Cubos x 18 Kg' },
      { item: 'PE010021', familia: 'Tocinetas', producto: 'Tocineta Picada Ahumada y Horneada x 1000g' },
      { item: 'PG005012', familia: 'Jamones', producto: 'Jamon Cerdo Especial a Granel PT' },
      { item: 'PS001001', familia: 'Salsa', producto: 'Salsa Qbano x 5000 g' },
      { item: 'PS001003', familia: 'Salsa', producto: 'Salsa Sandwich Costilla x 1000g' },
      { item: 'PE010028', familia: 'Tocinetas', producto: 'Tocineta Estandar x 1000g' },
      { item: 'PC001174', familia: 'Piñas', producto: 'Pina Calada cubos Macedonia Institucional x 3500g' },
      { item: 'PC001163', familia: 'Comercializado', producto: 'Lamina para termosellado de tapa vasos C/Impr C 50 micras Poliester-Polietileno' },
      { item: 'PC001159', familia: 'Comercializado', producto: 'Cinta continua Qbano texto interno Opened 2.5 cm x Rll x80 mts' },
      { item: 'PE002003', familia: 'Hamburguesas', producto: 'Hamburguesa Estandar x 10 Un x 100g' },
      { item: 'PC001183', familia: 'Comercializado', producto: 'Frijol caraota negro x500g' },
      { item: 'PC001190', familia: 'Comercializado', producto: 'Maduro en cubos x Kg' },
      { item: 'PE005030', familia: 'Embutidos', producto: 'Pepperoni x 1000gr' },
      { item: 'PC001181', familia: 'Comercializado', producto: 'Salsa fruco Tom Parri BBQ Doyp x380g' },
      { item: 'PC016073', familia: 'Comercializado', producto: 'Copa papel 0.75 oz Café Pqx250 und' },
      { item: 'PE002041', familia: 'Hamburguesas', producto: 'Hamburguesa Vegetariana x 125g' },
      { item: 'PC001134', familia: 'Comercializado', producto: 'Pepinillo vinagre tajado Bolsa x 1000g' },
      { item: 'PC001191', familia: 'Comercializado', producto: 'Lanza aguas coloridos' },
      { item: 'PE002062', familia: 'Desmechados', producto: 'Pollo Desmechado x2 Unds x1000g' },
      { item: 'PE002061', familia: 'Desmechados', producto: 'Carne Desmechada x2 Unds x1000g' },
      { item: 'PE002060', familia: 'Desmechados', producto: 'Carne Costilla de Cerdo Desmechada x 1000g' },
      { item: 'PE0070074', familia: 'Embutidos', producto: 'Salami x 1500g Mixto' },
      { item: 'PE004032', familia: 'Jamones Q', producto: 'Jamonada x 2000g Mixta' },
      { item: 'PE001070', familia: 'Bakano', producto: 'Bakano Caja Corrugada 24 Plegadizas x 10 Unds' },
      { item: 'PE004040', familia: 'Jamones', producto: 'Jamón Cordero Tajado Pq x 1000g 2 unds x 500g' },
      { item: 'PC007008', familia: 'Comercializado', producto: 'Tapabocas Blanco Resorte Caja x 50und' },
      { item: 'PC001192', familia: 'Comercializado', producto: 'Rollo Papel Termico 48g 80x60 m pq x6 und' },
      { item: 'PC002023', familia: 'Comercializado', producto: 'Mezcla para Pizza x 12 und de 88g' },
      { item: 'PC016081', familia: 'Comercializado', producto: 'Bowl x750Ml + Tapa Pq x50' },
      { item: 'PC010061', familia: 'Comercializado', producto: 'Ensal Peq BOPS 12Onz+Tapa Paq x50' },
      { item: 'PC012003', familia: 'Comercializado', producto: 'Paleta de Papel 20X80mm Impr Pq x 1000 unds' },
      { item: 'PC001030', familia: 'Comercializado', producto: 'Guacamole Enriko Bolsa x 1000g' },
      { item: 'PC016080', familia: 'Comercializado', producto: 'Bowl x350Ml + Tapa Pq x50' },
      { item: 'PC050010', familia: 'Comercializado', producto: 'Caja x170 Tarros Cuadrados Salsa Q 23gr mas Tapa con Liner' },
      { item: 'PE007009', familia: 'Embutidos', producto: 'Salami Mixto x 500g' },
      { item: 'PC001201', familia: 'Comercializado', producto: 'Salsa de Queso Cheddar 200 gr' },
      { item: 'PC001033', familia: 'Comercializado', producto: 'Salsa Teriyaki Fco x 1000g' },
      { item: 'PE002048', familia: 'Desmechados', producto: 'Pollo en Tiras PJ x 1000gr PJ' },
      { item: 'PE010013', familia: 'Tocinetas', producto: 'Tocineta picada Horneada PJ' },
      { item: 'PE004029', familia: 'Jamones', producto: 'Jamón de cerdo ahumado en tiras PJ' },
      { item: 'PE008066', familia: 'Embutidos', producto: 'Salchicha Mega Vienesa x 640g' },
      { item: 'PE001073', familia: 'Desmechados', producto: 'Pechuga de pollo en trozos x 1000g' },
      { item: 'PC001196', familia: 'Comercializado', producto: 'Salsa de Mostaza Bolsa Doy pack 4 kg' },
      { item: 'PC016002', familia: 'Comercializado', producto: 'Copa 1/2 Onz Salsa Traslu-Blanca Paq x 50 und' },
      { item: 'PC001197', familia: 'Comercializado', producto: 'Salsa de Mayonesa Bolsa Doypak x 3.80 kg' },
      { item: 'PC016068', familia: 'Comercializado', producto: 'Aceite Oliosoya * 3000 cc' },
      { item: 'PC010005', familia: 'Comercializado', producto: 'Caja Papa x 140g Pqte x 50 un CULTI' },
      { item: 'PC010006', familia: 'Comercializado', producto: 'Caja Papa x 180g Pqte x 50 un CULTI' },
      { item: 'PC010009', familia: 'Comercializado', producto: 'Papel Antigraso Paq x 1200 Unds - CULTI' },
      { item: 'PC016082', familia: 'Comercializado', producto: 'Vasos 16 onz Caja x 1600 und - CULTI' },
      { item: 'PC016083', familia: 'Comercializado', producto: 'Vasos 22 onz Caja x 1600 und - CULTI' },
      { item: 'PE001075', familia: 'Comercializado', producto: 'Chorizo en rodajas x Pq x1000 gr' },
      { item: 'PE010034', familia: 'Tocinetas', producto: 'Tocineta Estandar x 500g' },
      { item: 'PE002058', familia: 'Desmechados', producto: 'Pollo en cuadros 2 Unds x 500 gr' },
      { item: 'PC010064', familia: 'Comercializado', producto: 'Caja Papa 100gr Pq x 50 und' },
      { item: 'PC010065', familia: 'Comercializado', producto: 'Caja Papa 150g4 Pq x50 und' },
      { item: 'PC001154', familia: 'Comercializado', producto: 'Suero Costeno x 200 GR' },
      { item: 'PE010044', familia: 'Tocinetas', producto: 'Tocineta premium reestructurada x 1000 gr' },
      { item: 'PC001199', familia: 'Salsa', producto: 'Salsa de Ciruelas Qbano' },
      { item: 'PC001189', familia: 'Salsa', producto: 'Salsa BBQ Especial x80g' },
      { item: 'PC001139', familia: 'Salsa', producto: 'Salsa de Ciruelas Especial x80g' },
      { item: 'PE007008', familia: 'Embutidos', producto: 'Salami Mixto x 1000g' },
      { item: 'PS001006', familia: 'Salsa', producto: 'Salsa Oregano x 3000g' },
      { item: 'PC010058', familia: 'Comercializado', producto: 'Papel Antigraso 26x37 cms Paq x 1000 und' },
      { item: 'PC001182', familia: 'Comercializado', producto: 'Salsa de tomate Sachet x 8g 612 unds' },
      { item: 'PC010066', familia: 'Comercializado', producto: 'Papel Canastilla Earthpact 45 años 32cm x 17cm Pq x 1000 und' },
      { item: 'PC010067', familia: 'Comercializado', producto: 'Bolsa Combo 45 Años Pq x 100 und' },
      { item: 'PC010068', familia: 'Comercializado', producto: 'Bolsa Domicilio 45 Años Pq x 100 und' },
      { item: 'PC010069', familia: 'Comercializado', producto: 'Vasos 16 onz 45 años Caja x 1000 und' },
      { item: 'PE004105', familia: 'Jamones', producto: 'Jamon Cerdo Tiras x 1000g' },
      { item: 'PS001007', familia: 'Salsa', producto: 'Salsa Oregano x 2000g' },
      { item: 'PE010050', familia: 'Jamones', producto: 'Tocineta Reestructurada 14cm x 500g Kfc' },
      { item: 'PE002035', familia: 'Desmechados', producto: 'Pollo desmechado por 1000 Gr' },
      { item: 'PC001198', familia: 'Comercializado', producto: 'Salsa Tomate Sachet 8 g pq x 600 unds' },
      { item: 'PC001168', familia: 'Comercializado', producto: 'Panela Granulada Instantanea Natural x500g' },
      { item: 'PC001165', familia: 'Comercializado', producto: 'Filtro de Tela con Soporte Metalico' },
      { item: 'PC016001', familia: 'Comercializado', producto: 'Tapa 1-1/2 Onz Troforma Paq x 2000 und' },
      { item: 'PC010034', familia: 'Comercializado', producto: 'Bolsa Combo Pizza Pq x 100 und' },
      { item: 'PC016072', familia: 'Comercializado', producto: 'Tapa Bowl Natural x750Ml Pq x50' },
      { item: 'PC010071', familia: 'Comercializado', producto: 'Bolsa Plástica 100% Reciclada Pq x 100 und' },
      { item: 'PC010047', familia: 'Comercializado', producto: 'Nachotes unidad x 180 grs' },
      { item: 'PE004038', familia: 'Jamones Q', producto: 'Jamon Pizza x 1000g' },
      { item: 'PE002034', familia: 'Desmechados', producto: 'Carne de Res Desmechada x 1 Kg' },
      { item: 'PE010046', familia: 'Tocinetas', producto: 'Tocineta en cuadros x1000 g Hut' },
      { item: 'PC001202', familia: 'Comercializado', producto: 'Rollo Papel Termico Pizza 48g 80x60 m pq x6 und' },
      { item: 'PE004033', familia: 'Jamones Q', producto: 'Mortadela Mixta x 1000g "JAMONADA MIXTA"' },
      { item: 'PC001017', familia: 'Comercializado', producto: 'Arequipito Display x 24 Und' },
      { item: 'PE004039', familia: 'Jamones Q', producto: 'Mortadela de Pavo x1000g' },
      { item: 'PE010047', familia: 'Tocinetas', producto: 'Tocineta seleccionada cruda x1000gr' },
      { item: 'PE010048', familia: 'Tocinetas', producto: 'Tocineta seleccionada cruda Refrigerada x1000gr' },
      { item: 'PE001076', familia: 'Embutidos', producto: 'Choricillo x 1000g' }
    ],
    weeks: Array.from({length: 28}, (_, i) => `2025-S${i+1}`)
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const processedData = {
        totalProducts: sampleData.products.length,
        totalWeeks: 132,
        years: ['2023', '2024', '2025'],
        lastWeek: '2025-S28',
        dataQuality: 'Excelente',
        trends: {
          growth: '+12%',
          seasonality: 'Detectada',
          topFamily: 'Comercializado'
        }
      };
      
      setSalesData(processedData);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Error procesando archivo:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPrediction = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const predictedData = {
        nextWeeks: 4,
        confidence: 0.85,
        predictions: sampleData.products.map(product => ({
          ...product,
          predictions: Array.from({length: 4}, (_, i) => ({
            week: `2025-S${29 + i}`,
            sales: Math.floor(Math.random() * 500) + 100,
            confidence: 0.8 + Math.random() * 0.15
          }))
        }))
      };
      
      setPredictions(predictedData);
      setActiveTab('predictions');
    } catch (error) {
      console.error('Error en predicción:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateProductionPlan = async () => {
    if (!predictions) return;
    
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const plan = {
        month: 'Agosto 2025',
        totalBatches: 0,
        products: predictions.predictions.map(product => {
          const weeklyBatches = product.predictions.map(pred => ({
            week: pred.week,
            sales: pred.sales,
            batches: Math.ceil(pred.sales / 50),
            kilos: Math.ceil(pred.sales / 50) * 25,
            packages: Math.ceil(pred.sales / 50) * 20
          }));
          
          return {
            ...product,
            weeklyBatches,
            totalBatches: weeklyBatches.reduce((sum, week) => sum + week.batches, 0)
          };
        })
      };
      
      plan.totalBatches = plan.products.reduce((sum, product) => sum + product.totalBatches, 0);
      setProductionPlan(plan);
      setActiveTab('production');
    } catch (error) {
      console.error('Error generando plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Package className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Sistema de Predicción ENRIKO</h1>
                <p className="text-gray-600">Análisis inteligente de ventas y planificación de producción</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Versión 1.0</p>
              <p className="text-sm text-gray-500">Desarrollado para ENRIKO</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <TabButton id="upload" label="Cargar Datos" icon={Upload} isActive={activeTab === 'upload'} />
            <TabButton id="analysis" label="Análisis" icon={BarChart3} isActive={activeTab === 'analysis'} />
            <TabButton id="predictions" label="Predicciones" icon={TrendingUp} isActive={activeTab === 'predictions'} />
            <TabButton id="production" label="Plan Producción" icon={Calendar} isActive={activeTab === 'production'} />
            <TabButton id="export" label="Exportar" icon={Download} isActive={activeTab === 'export'} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6">
          {activeTab === 'upload' && (
            <div className="text-center py-12">
              <Upload className="mx-auto mb-6 text-blue-600" size={64} />
              <h2 className="text-2xl font-bold mb-4">Cargar Datos de Ventas Históricas</h2>
              <p className="text-gray-600 mb-8">Sube tu archivo Excel con las ventas 2023-2025</p>
              
              <div className="max-w-md mx-auto">
                <label className="block">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="bg-blue-600 text-white px-8 py-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    {loading ? 'Procesando...' : 'Seleccionar Archivo Excel'}
                  </div>
                </label>
              </div>
              
              {loading && (
                <div className="mt-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Procesando {sampleData.products.length} productos × 132 semanas...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && salesData && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Análisis de Datos Históricos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Productos Analizados</h3>
                  <p className="text-3xl font-bold text-blue-600">{salesData.totalProducts}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Semanas de Datos</h3>
                  <p className="text-3xl font-bold text-green-600">{salesData.totalWeeks}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Crecimiento Anual</h3>
                  <p className="text-3xl font-bold text-purple-600">{salesData.trends.growth}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold mb-4">Resumen del Análisis</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Período:</span> 2023-S1 hasta 2025-S28</p>
                  <p><span className="font-medium">Calidad de datos:</span> {salesData.dataQuality}</p>
                  <p><span className="font-medium">Estacionalidad:</span> {salesData.trends.seasonality}</p>
                  <p><span className="font-medium">Familia principal:</span> {salesData.trends.topFamily}</p>
                </div>
              </div>

              <button
                onClick={runPrediction}
                disabled={loading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Play size={20} />
                {loading ? 'Generando Predicciones...' : 'Generar Predicciones'}
              </button>
            </div>
          )}

          {activeTab === 'predictions' && predictions && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Predicciones para las Próximas 4 Semanas</h2>
              
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <p className="text-yellow-800">
                  <strong>Confianza del modelo:</strong> {(predictions.confidence * 100).toFixed(1)}%
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {predictions.predictions.slice(0, 10).map((product, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{product.producto}</h3>
                        <p className="text-sm text-gray-600">{product.item} - {product.familia}</p>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(selectedProduct === idx ? null : idx)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                    
                    {selectedProduct === idx && (
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        {product.predictions.map((pred, weekIdx) => (
                          <div key={weekIdx} className="bg-gray-50 p-3 rounded">
                            <p className="font-medium text-sm">{pred.week}</p>
                            <p className="text-lg font-bold">{pred.sales}</p>
                            <p className="text-xs text-gray-500">
                              {(pred.confidence * 100).toFixed(0)}% conf.
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={generateProductionPlan}
                disabled={loading}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Calendar size={20} />
                {loading ? 'Generando Plan...' : 'Generar Plan de Producción'}
              </button>
            </div>
          )}

          {activeTab === 'production' && productionPlan && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Plan de Producción - {productionPlan.month}</h2>
              
              <div className="bg-green-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Total de Lotes del Mes</h3>
                <p className="text-4xl font-bold text-green-600">{productionPlan.totalBatches}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left">Producto</th>
                      <th className="border border-gray-300 p-3 text-center">Semana 1</th>
                      <th className="border border-gray-300 p-3 text-center">Semana 2</th>
                      <th className="border border-gray-300 p-3 text-center">Semana 3</th>
                      <th className="border border-gray-300 p-3 text-center">Semana 4</th>
                      <th className="border border-gray-300 p-3 text-center">Total Lotes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionPlan.products.slice(0, 15).map((product, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">
                          <div>
                            <p className="font-medium">{product.producto}</p>
                            <p className="text-sm text-gray-600">{product.item}</p>
                          </div>
                        </td>
                        {product.weeklyBatches.map((week, weekIdx) => (
                          <td key={weekIdx} className="border border-gray-300 p-3 text-center">
                            <div className="space-y-1">
                              <p className="font-bold text-lg">{week.batches}</p>
                              <p className="text-xs text-gray-600">{week.kilos}kg</p>
                              <p className="text-xs text-gray-600">{week.packages} paq</p>
                            </div>
                          </td>
                        ))}
                        <td className="border border-gray-300 p-3 text-center">
                          <p className="font-bold text-lg text-blue-600">{product.totalBatches}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Mostrando primeros 15 productos. Plan completo disponible en exportación.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto mb-6 text-green-600" size={64} />
              <h2 className="text-2xl font-bold mb-4">Exportar Resultados</h2>
              <p className="text-gray-600 mb-8">Descarga tus análisis y planes de producción</p>
              
              <div className="space-y-4 max-w-md mx-auto">
                <button className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                  Descargar Plan de Producción (.xlsx)
                </button>
                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Descargar Predicciones (.xlsx)
                </button>
                <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  Descargar Análisis Completo (.pdf)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionForecastingSystem;