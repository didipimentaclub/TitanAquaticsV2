import React, { useState } from 'react';
import { Calculator, Layers, Droplets, Zap, ArrowLeftRight, Brain, ArrowLeft } from 'lucide-react';

type ToolId = 'volume' | 'substrato' | 'co2' | 'energia' | 'conversor' | 'diagnostico';

interface Tool {
  id: ToolId;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const TOOLS: Tool[] = [
  { id: 'volume', name: 'Calculadora de Volume', description: 'Calcule o volume de tanques retangulares e cilíndricos, incluindo sump.', icon: <Calculator size={32} /> },
  { id: 'substrato', name: 'Calculadora de Substrato', description: 'Descubra a quantidade exata de areia ou solo fértil para seu projeto.', icon: <Layers size={32} /> },
  { id: 'co2', name: 'Tabela de CO2', description: 'Verifique a concentração de CO2 baseada na relação pH x KH.', icon: <Droplets size={32} /> },
  { id: 'energia', name: 'Custo de Energia', description: 'Estime o consumo elétrico mensal dos seus equipamentos.', icon: <Zap size={32} /> },
  { id: 'conversor', name: 'Conversor de Medidas', description: 'Converta Galões/Litros, Graus, Dureza (dGH/ppm).', icon: <ArrowLeftRight size={32} /> },
  { id: 'diagnostico', name: 'Diagnóstico IA', description: 'Identifique doenças e receba tratamentos com IA. (Use o Copilot)', icon: <Brain size={32} /> },
];

export const FerramentasSection: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <h2 className="text-3xl font-heading font-bold text-white mb-2">Ferramentas</h2>
      <p className="text-slate-400 mb-8">Laboratório de Ferramentas - Utilitários essenciais para manutenção e planejamento.</p>

      {!activeTool ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => tool.id !== 'diagnostico' && setActiveTool(tool.id)}
              className={`p-6 rounded-xl border text-left transition-all flex flex-col items-center text-center ${
                tool.id === 'diagnostico'
                  ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                  : 'border-white/10 bg-[#1a1b3b]/60 hover:border-[#4fb7b3]/50 hover:bg-[#1a1b3b]'
              }`}
            >
              <div className="p-4 rounded-full bg-white/5 text-white mb-4 transition-colors">
                <div className={tool.id !== 'diagnostico' ? 'text-[#4fb7b3]' : ''}>{tool.icon}</div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3>
              <p className="text-sm text-slate-400">{tool.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setActiveTool(null)}
            className="mb-6 text-[#4fb7b3] hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Voltar às ferramentas
          </button>
          
          <div className="max-w-3xl mx-auto">
            {activeTool === 'volume' && <VolumeCalculator />}
            {activeTool === 'substrato' && <SubstratoCalculator />}
            {activeTool === 'co2' && <CO2Table />}
            {activeTool === 'energia' && <EnergiaCalculator />}
            {activeTool === 'conversor' && <Conversor />}
          </div>
        </div>
      )}
    </div>
  );
};

// Calculadora de Volume
const VolumeCalculator: React.FC = () => {
  const [tipo, setTipo] = useState<'retangular' | 'cilindrico'>('retangular');
  const [dims, setDims] = useState({ comprimento: '', largura: '', altura: '', raio: '' });
  const [sump, setSump] = useState('');

  const calcVolume = () => {
    if (tipo === 'retangular') {
      const vol = (parseFloat(dims.comprimento) * parseFloat(dims.largura) * parseFloat(dims.altura)) / 1000;
      return isNaN(vol) ? 0 : vol;
    } else {
      const vol = (Math.PI * Math.pow(parseFloat(dims.raio), 2) * parseFloat(dims.altura)) / 1000;
      return isNaN(vol) ? 0 : vol;
    }
  };

  const volumeTotal = calcVolume() + (parseFloat(sump) || 0);

  return (
    <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Calculadora de Volume</h2>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTipo('retangular')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm uppercase ${tipo === 'retangular' ? 'bg-[#4fb7b3] text-black' : 'bg-white/10 text-white'}`}
        >
          Retangular
        </button>
        <button
          onClick={() => setTipo('cilindrico')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm uppercase ${tipo === 'cilindrico' ? 'bg-[#4fb7b3] text-black' : 'bg-white/10 text-white'}`}
        >
          Cilíndrico
        </button>
      </div>

      <div className="space-y-3">
        {tipo === 'retangular' ? (
          <>
            <input type="number" placeholder="Comprimento (cm)" value={dims.comprimento} onChange={e => setDims({...dims, comprimento: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
            <input type="number" placeholder="Largura (cm)" value={dims.largura} onChange={e => setDims({...dims, largura: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
            <input type="number" placeholder="Altura (cm)" value={dims.altura} onChange={e => setDims({...dims, altura: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
          </>
        ) : (
          <>
            <input type="number" placeholder="Raio (cm)" value={dims.raio} onChange={e => setDims({...dims, raio: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
            <input type="number" placeholder="Altura (cm)" value={dims.altura} onChange={e => setDims({...dims, altura: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
          </>
        )}
        <input type="number" placeholder="Volume do Sump (L) - opcional" value={sump} onChange={e => setSump(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
      </div>

      <div className="mt-6 p-4 bg-[#4fb7b3]/20 rounded-lg">
        <p className="text-sm text-slate-300">Volume do Aquário: <span className="font-bold text-white">{calcVolume().toFixed(1)} L</span></p>
        {sump && <p className="text-sm text-slate-300">Volume do Sump: <span className="font-bold text-white">{parseFloat(sump).toFixed(1)} L</span></p>}
        <p className="text-lg text-[#4fb7b3] font-bold mt-2">Total: {volumeTotal.toFixed(1)} Litros</p>
      </div>
    </div>
  );
};

// Calculadora de Substrato
const SubstratoCalculator: React.FC = () => {
  const [dims, setDims] = useState({ comprimento: '', largura: '', altura: '' });
  const [tipo, setTipo] = useState<'areia' | 'cascalho' | 'solo'>('areia');

  const densidades = { areia: 1.6, cascalho: 1.5, solo: 1.0 };
  
  const calcKg = () => {
    const volumeL = (parseFloat(dims.comprimento) * parseFloat(dims.largura) * parseFloat(dims.altura)) / 1000;
    return isNaN(volumeL) ? 0 : volumeL * densidades[tipo];
  };

  return (
    <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6 max-w-md">
      <h2 className="text-xl font-bold text-white mb-4">Calculadora de Substrato</h2>
      
      <div className="flex gap-2 mb-4">
        {(['areia', 'cascalho', 'solo'] as const).map(t => (
          <button key={t} onClick={() => setTipo(t)} className={`flex-1 py-2 rounded-lg font-bold capitalize text-sm ${tipo === t ? 'bg-[#4fb7b3] text-black' : 'bg-white/10 text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <input type="number" placeholder="Comprimento (cm)" value={dims.comprimento} onChange={e => setDims({...dims, comprimento: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
        <input type="number" placeholder="Largura (cm)" value={dims.largura} onChange={e => setDims({...dims, largura: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
        <input type="number" placeholder="Altura desejada (cm)" value={dims.altura} onChange={e => setDims({...dims, altura: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
      </div>

      <div className="mt-6 p-4 bg-[#4fb7b3]/20 rounded-lg">
        <p className="text-lg text-[#4fb7b3] font-bold">Quantidade necessária: {calcKg().toFixed(1)} kg</p>
        <p className="text-xs text-slate-400 mt-1">Densidade usada: {densidades[tipo]} kg/L ({tipo})</p>
      </div>
    </div>
  );
};

// Tabela CO2
const CO2Table: React.FC = () => {
  const [ph, setPh] = useState('7.0');
  const [kh, setKh] = useState('4');

  const calcCO2 = () => {
    const co2 = 3 * parseFloat(kh) * Math.pow(10, 7 - parseFloat(ph));
    return isNaN(co2) ? 0 : co2;
  };

  const co2 = calcCO2();
  const status = co2 < 15 ? { text: 'Baixo (favorece algas)', color: 'text-amber-400' } 
    : co2 <= 30 ? { text: 'Ideal para plantas', color: 'text-emerald-400' }
    : { text: 'Alto (perigo para peixes)', color: 'text-rose-400' };

  return (
    <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6 max-w-md">
      <h2 className="text-xl font-bold text-white mb-4">Tabela de CO2</h2>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-[#4fb7b3] uppercase font-bold">pH</label>
          <input type="number" step="0.1" value={ph} onChange={e => setPh(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
        </div>
        <div>
          <label className="text-xs text-[#4fb7b3] uppercase font-bold">KH (dKH)</label>
          <input type="number" value={kh} onChange={e => setKh(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#4fb7b3]/20 rounded-lg">
        <p className="text-lg font-bold text-white">CO2: {co2.toFixed(1)} ppm</p>
        <p className={`text-sm font-bold ${status.color}`}>{status.text}</p>
      </div>

      <p className="text-xs text-slate-500 mt-4">Fórmula: CO2 = 3 × KH × 10^(7-pH)</p>
    </div>
  );
};

// Calculadora de Energia
const EnergiaCalculator: React.FC = () => {
  const [equipamentos, setEquipamentos] = useState([{ nome: '', watts: '', horas: '24' }]);
  const [tarifa, setTarifa] = useState('0.85');

  const addEquipamento = () => setEquipamentos([...equipamentos, { nome: '', watts: '', horas: '24' }]);
  
  const calcTotal = () => {
    return equipamentos.reduce((total, eq) => {
      const kwh = (parseFloat(eq.watts) * parseFloat(eq.horas) * 30) / 1000;
      return total + (isNaN(kwh) ? 0 : kwh);
    }, 0);
  };

  const kwhTotal = calcTotal();
  const custoTotal = kwhTotal * parseFloat(tarifa);

  return (
    <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6 max-w-lg">
      <h2 className="text-xl font-bold text-white mb-4">Custo de Energia</h2>
      
      <div className="space-y-3 mb-4">
        {equipamentos.map((eq, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <input placeholder="Item" value={eq.nome} onChange={e => { const n = [...equipamentos]; n[i].nome = e.target.value; setEquipamentos(n); }} className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
            <input type="number" placeholder="Watts" value={eq.watts} onChange={e => { const n = [...equipamentos]; n[i].watts = e.target.value; setEquipamentos(n); }} className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
            <input type="number" placeholder="Hrs/dia" value={eq.horas} onChange={e => { const n = [...equipamentos]; n[i].horas = e.target.value; setEquipamentos(n); }} className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        ))}
      </div>

      <button onClick={addEquipamento} className="text-[#4fb7b3] text-sm mb-4 font-bold uppercase tracking-wide hover:text-white">+ Adicionar equipamento</button>

      <div className="mb-4">
        <label className="text-xs text-[#4fb7b3] uppercase font-bold">Tarifa (R$/kWh)</label>
        <input type="number" step="0.01" value={tarifa} onChange={e => setTarifa(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none" />
      </div>

      <div className="p-4 bg-[#4fb7b3]/20 rounded-lg">
        <p className="text-sm text-slate-300">Consumo mensal: <span className="font-bold text-white">{kwhTotal.toFixed(1)} kWh</span></p>
        <p className="text-lg text-[#4fb7b3] font-bold">Custo estimado: R$ {custoTotal.toFixed(2)}/mês</p>
      </div>
    </div>
  );
};

// Conversor de Medidas
const Conversor: React.FC = () => {
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'volume' | 'temp' | 'dureza'>('volume');

  const convert = () => {
    const v = parseFloat(valor);
    if (isNaN(v)) return { a: 0, b: 0 };
    
    if (tipo === 'volume') return { a: v * 0.264172, b: v / 0.264172 }; // L <-> Gal
    if (tipo === 'temp') return { a: (v * 9/5) + 32, b: (v - 32) * 5/9 }; // C <-> F
    return { a: v * 17.848, b: v / 17.848 }; // dGH <-> ppm
  };

  const result = convert();

  return (
    <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6 max-w-md">
      <h2 className="text-xl font-bold text-white mb-4">Conversor de Medidas</h2>
      
      <div className="flex gap-2 mb-4">
        {(['volume', 'temp', 'dureza'] as const).map(t => (
          <button key={t} onClick={() => setTipo(t)} className={`flex-1 py-2 rounded-lg font-bold capitalize text-sm ${tipo === t ? 'bg-[#4fb7b3] text-black' : 'bg-white/10 text-white'}`}>
            {t === 'volume' ? 'Volume' : t === 'temp' ? 'Temp.' : 'Dureza'}
          </button>
        ))}
      </div>

      <input
        type="number"
        value={valor}
        onChange={e => setValor(e.target.value)}
        placeholder={tipo === 'volume' ? 'Litros' : tipo === 'temp' ? '°Celsius' : 'dGH'}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white mb-4 focus:border-[#4fb7b3] outline-none"
      />

      <div className="p-4 bg-[#4fb7b3]/20 rounded-lg space-y-2">
        {tipo === 'volume' && (
          <>
            <p className="text-white">{valor || 0} L = <span className="font-bold text-[#4fb7b3]">{result.a.toFixed(2)} Galões</span></p>
            <p className="text-white">{valor || 0} Gal = <span className="font-bold text-[#4fb7b3]">{result.b.toFixed(2)} Litros</span></p>
          </>
        )}
        {tipo === 'temp' && (
          <>
            <p className="text-white">{valor || 0} °C = <span className="font-bold text-[#4fb7b3]">{result.a.toFixed(1)} °F</span></p>
            <p className="text-white">{valor || 0} °F = <span className="font-bold text-[#4fb7b3]">{result.b.toFixed(1)} °C</span></p>
          </>
        )}
        {tipo === 'dureza' && (
          <>
            <p className="text-white">{valor || 0} dGH = <span className="font-bold text-[#4fb7b3]">{result.a.toFixed(1)} ppm</span></p>
            <p className="text-white">{valor || 0} ppm = <span className="font-bold text-[#4fb7b3]">{result.b.toFixed(2)} dGH</span></p>
          </>
        )}
      </div>
    </div>
  );
};