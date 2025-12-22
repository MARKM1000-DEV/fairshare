import { useState } from 'react';
import { Share2, RotateCcw, PartyPopper, Calculator, Crown, BadgeCheck, ChevronDown, ChevronUp, Users, TrendingUp, TrendingDown, Percent, Music } from 'lucide-react'; // Removido Info
import { useBillStore } from '../../store/useBillStore';
import { formatCurrency, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SponsorModal } from './SponsorModal';

export const SummaryScreen = () => {
  const { config, people, items, manualPayments, reset } = useBillStore();
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedPersonId === id) setExpandedPersonId(null);
    else setExpandedPersonId(id);
  };

  // 1. CÁLCULO ORIGINAL
  const calculateOriginalBill = () => {
    // Removido taxMultiplier que não estava sendo usado
    
    let couvertPerPerson = 0;
    if (config.couvertMode === 'person') {
        couvertPerPerson = config.couvert;
    } else {
        couvertPerPerson = config.couvert / (people.length || 1);
    }
    const fixedBase = config.fixedCost + couvertPerPerson;

    return people.map(person => {
      let myExtrasTotal = 0;
      let myExtrasCount = 0;
      
      const myItemsDetail: Array<{
          name: string, 
          qty: number, 
          total: number, 
          isShared: boolean, 
          totalSlices: number
      }> = [];

      items.forEach(item => {
        const myQuantity = item.assignedTo.filter(id => id === person.id).length;
        if (myQuantity > 0) {
          myExtrasCount += myQuantity;
          let itemCostForMe = 0;
          let isShared = false;
          let totalSlices = 1;

          if (item.pricingMode === 'unit') {
            itemCostForMe = (item.price * myQuantity);
            isShared = false;
          } else {
            totalSlices = item.assignedTo.length;
            if (totalSlices > 0) {
                itemCostForMe = ((item.price / totalSlices) * myQuantity);
            }
            isShared = true;
          }
          
          myExtrasTotal += itemCostForMe;
          
          myItemsDetail.push({
              name: item.name,
              qty: myQuantity,
              total: itemCostForMe,
              isShared,
              totalSlices
          });
        }
      });

      const subtotal = fixedBase + myExtrasTotal;
      const taxAmount = subtotal * config.serviceTax;
      const originalTotal = subtotal + taxAmount;

      return {
        ...person,
        extrasCount: myExtrasCount,
        originalTotal,
        details: {
            base: fixedBase,
            items: myItemsDetail,
            tax: taxAmount
        }
      };
    });
  };

  const resultsOriginal = calculateOriginalBill();
  const grandTotalOriginal = resultsOriginal.reduce((acc, p) => acc + p.originalTotal, 0);

  // 2. CÁLCULO FINAL COM AJUSTES
  const manualPayers = resultsOriginal.filter(p => manualPayments[p.id] !== undefined && manualPayments[p.id] !== null);
  const totalPaidByManual = manualPayers.reduce((acc, p) => acc + (manualPayments[p.id] || 0), 0);
  const remainingBill = Math.max(0, grandTotalOriginal - totalPaidByManual);

  const beneficiaries = resultsOriginal.filter(p => manualPayments[p.id] === undefined || manualPayments[p.id] === null);
  const beneficiariesOriginalTotal = beneficiaries.reduce((acc, p) => acc + p.originalTotal, 0);

  const discountFactor = beneficiariesOriginalTotal > 0 
      ? remainingBill / beneficiariesOriginalTotal 
      : 0;

  const resultsFinal = resultsOriginal.map(p => {
      const manualVal = manualPayments[p.id];
      let finalToPay = 0;
      let isManual = false;
      let status: 'normal' | 'sponsor' | 'hero' | 'fixed_low' = 'normal';

      if (manualVal !== undefined && manualVal !== null) {
          finalToPay = manualVal;
          isManual = true;
          if (manualVal >= (grandTotalOriginal - 1)) status = 'hero';
          else if (manualVal > p.originalTotal) status = 'sponsor';
          else status = 'fixed_low';
      } else {
          finalToPay = p.originalTotal * discountFactor;
          status = 'normal';
      }

      return { ...p, finalToPay, isManual, status };
  }).sort((a, b) => b.finalToPay - a.finalToPay);

  const hasGoldenSponsor = resultsFinal.some(p => p.status === 'hero' || p.status === 'sponsor');

  const getSharedText = (qty: number, total: number) => {
      if (qty === 1) return `Dividido por ${total}`;
      return `${qty} de ${total} partes`;
  };

  // --- COMPARTILHAMENTO NATIVO ---
  const handleShare = async () => {
    let text = `🧾 *Conta FairShare*\n`;
    text += `Total Mesa: *${formatCurrency(grandTotalOriginal)}*\n`;
    
    if (config.serviceTax > 0 || config.couvert > 0) {
        text += `(`;
        if (config.serviceTax > 0) text += `Taxa ${Math.round(config.serviceTax * 100)}%`;
        if (config.serviceTax > 0 && config.couvert > 0) text += ` + `;
        if (config.couvert > 0) text += `Couvert ${formatCurrency(config.couvert)}`;
        text += ` inclusos)\n`;
    }

    if (manualPayers.length > 0) {
        text += `\n📌 *Ajustes/Fixos:*\n`;
        manualPayers.forEach(s => {
             const label = manualPayments[s.id]! > 0 ? "pagou fixo" : "isento";
             text += `- ${s.name} ${label}: ${formatCurrency(manualPayments[s.id] || 0)}\n`;
        });
        text += `\n🔻 *Rateio Final:*\n`;
    } else {
        text += `----------------\n`;
    }

    resultsFinal.forEach(p => {
       if (!p.isManual) {
           text += `\n👤 *${p.name}*: ${formatCurrency(p.finalToPay)}`;
           
           if (manualPayers.length > 0 && Math.abs(p.originalTotal - p.finalToPay) > 0.05) {
                text += ` (Era ${formatCurrency(p.originalTotal)})\n`;
           } else {
                text += `\n`;
           }

           if (p.details.base > 0) {
               text += `   ▫️ Base/Rodízio: ${formatCurrency(p.details.base)}\n`;
           }
           
           p.details.items.forEach(item => {
               if (item.isShared) {
                   text += `   ▫️ ${item.name} (${getSharedText(item.qty, item.totalSlices)}): ${formatCurrency(item.total)}\n`;
               } else {
                   text += `   ▫️ ${item.qty}x ${item.name}: ${formatCurrency(item.total)}\n`;
               }
           });

           if (p.details.tax > 0) {
               text += `   ▫️ Taxa Serviço: ${formatCurrency(p.details.tax)}\n`;
           }
       }
    });
    
    text += `\nCalculado via FairShare App`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Conta FairShare',
                text: text,
            });
        } catch (error) {
            console.log('Compartilhamento cancelado');
        }
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* HEADER */}
      <div className={cn(
          "text-white pt-10 pb-6 px-6 rounded-b-[2rem] shadow-xl z-10 text-center transition-colors relative overflow-hidden",
          hasGoldenSponsor 
            ? "bg-gradient-to-b from-yellow-600 to-yellow-500" 
            : (manualPayers.length > 0 ? "bg-blue-900" : "bg-black")
      )}>
        <span className="opacity-70 text-sm font-medium tracking-widest uppercase relative z-10">
            {manualPayers.length > 0 ? "Restante a Dividir" : "Total da Mesa"}
        </span>
        <div className="text-5xl font-bold mt-1 tracking-tight flex items-center justify-center gap-2 relative z-10">
            {formatCurrency(manualPayers.length > 0 ? remainingBill : grandTotalOriginal)}
        </div>
        
        {/* INFORMAÇÕES DINÂMICAS DE TAXA/COUVERT */}
        <div className="mt-3 flex flex-wrap gap-2 justify-center relative z-10 opacity-80">
            {config.serviceTax > 0 && (
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                   <Percent size={10} /> 
                   Taxa {Math.round(config.serviceTax * 100)}%
                </span>
            )}
            
            {config.couvert > 0 && (
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                   <Music size={10} /> 
                   Couvert {formatCurrency(config.couvert)} 
                   <span className="opacity-70">
                     ({config.couvertMode === 'person' ? 'Ind' : 'Mesa'})
                   </span>
                </span>
            )}
        </div>

        {manualPayers.length > 0 && (
            <div className={cn(
                "mt-3 text-sm font-bold inline-block px-3 py-1 rounded-full relative z-10",
                hasGoldenSponsor ? "bg-yellow-700/30 text-yellow-100" : "bg-blue-800/50 text-blue-100"
            )}>
                Aportes Fixos: {formatCurrency(totalPaidByManual)}
            </div>
        )}
      </div>

      {/* BOTÃO */}
      <div className="px-6 mt-4">
        <button 
            onClick={() => setIsSponsorModalOpen(true)}
            className={cn(
                "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm border",
                hasGoldenSponsor 
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                    : "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
            )}
        >
            <Calculator size={20} />
            {manualPayers.length > 0 ? "Gerenciar Valores" : "Definir Valor Fixo / Paitrocínio"}
        </button>
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {resultsFinal.map((person, index) => {
            let cardStyle = "bg-white border-gray-100";
            let icon = null;

            if (person.status === 'hero') {
                cardStyle = "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300";
                icon = <Crown size={16} className="text-yellow-600 fill-yellow-600" />;
            } else if (person.status === 'sponsor') {
                cardStyle = "bg-yellow-50 border-yellow-200";
                icon = <PartyPopper size={16} className="text-yellow-600" />;
            } else if (person.status === 'fixed_low') {
                cardStyle = "bg-blue-50 border-blue-200";
                icon = <BadgeCheck size={16} className="text-blue-500" />;
            }

            const isExpanded = expandedPersonId === person.id;
            const diff = person.finalToPay - person.originalTotal;
            const isPayingMore = diff > 0.05;
            const isPayingLess = diff < -0.05;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                key={person.id}
                className={cn(
                    "border rounded-xl overflow-hidden transition-all",
                    cardStyle,
                    isExpanded ? "ring-2 ring-black/5 shadow-lg" : ""
                )}
              >
                <button 
                    onClick={() => toggleExpand(person.id)}
                    className="w-full flex items-center justify-between p-4"
                >
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm relative shrink-0"
                            style={{ backgroundColor: person.avatarColor || '#ccc' }}
                        >
                            {person.status === 'hero' && (
                                <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full shadow-sm border-2 border-white">
                                    <Crown size={12} fill="currentColor"/>
                                </div>
                            )}
                            {person.name.charAt(0)}
                        </div>
                        
                        <div className="flex flex-col min-w-0 text-left">
                            <span className="font-bold text-gray-800 flex items-center gap-1.5 truncate">
                                {person.name}
                                {icon}
                            </span>
                            <span className="text-xs text-gray-500 truncate flex items-center gap-1">
                                {person.status === 'normal' && (
                                    manualPayers.length > 0 ? "Divisão restante" : `Base + ${person.extrasCount} itens`
                                )}
                                {person.status === 'hero' && "LENDÁRIO"}
                                {person.status === 'sponsor' && "Patrocinador"}
                                {person.status === 'fixed_low' && "Valor Fixo"}
                                {isExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                            </span>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className={cn(
                            "font-bold text-lg whitespace-nowrap", 
                            (person.status === 'sponsor' || person.status === 'hero') ? "text-yellow-700" : 
                            person.status === 'fixed_low' ? "text-blue-700" : "text-gray-900"
                        )}>
                            {formatCurrency(person.finalToPay)}
                        </div>
                        {person.status === 'normal' && (
                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                Ver Detalhes
                            </div>
                        )}
                    </div>
                </button>

                {/* PAINEL DE DETALHES */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50/80 border-t border-gray-100 px-4 py-3 text-sm space-y-2"
                        >
                            {person.details.base > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Base / Rodízio</span>
                                    <span>{formatCurrency(person.details.base)}</span>
                                </div>
                            )}

                            {person.details.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-gray-800 font-medium items-center">
                                    <div className="flex flex-col">
                                        <span className="flex items-center gap-1">
                                            {item.isShared && <Users size={12} className="text-blue-500" />}
                                            {item.isShared 
                                                ? `${item.name}` 
                                                : `${item.qty}x ${item.name}`
                                            }
                                        </span>
                                        {item.isShared && (
                                            <span className="text-[10px] text-blue-500">
                                                {getSharedText(item.qty, item.totalSlices)}
                                            </span>
                                        )}
                                    </div>
                                    <span>{formatCurrency(item.total)}</span>
                                </div>
                            ))}

                            {person.details.tax > 0 && (
                                <div className="flex justify-between text-gray-500 text-xs pt-1 border-t border-gray-200 mt-1">
                                    <span>Taxa de Serviço ({Math.round(config.serviceTax * 100)}%)</span>
                                    <span>{formatCurrency(person.details.tax)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 mt-1">
                                <span>Consumo Total Real</span>
                                <span>{formatCurrency(person.originalTotal)}</span>
                            </div>

                            {person.status === 'normal' && manualPayers.length > 0 && (
                                <div className={cn(
                                    "mt-2 p-2 rounded text-xs text-center font-bold flex items-center justify-center gap-1",
                                    isPayingMore ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                                )}>
                                    {isPayingMore ? (
                                        <>
                                            <TrendingUp size={14} />
                                            Acréscimo de rateio aplicado (+{formatCurrency(diff)})
                                        </>
                                    ) : isPayingLess ? (
                                        <>
                                            <TrendingDown size={14} />
                                            Desconto aplicado ({formatCurrency(diff)})
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
              </motion.div>
            );
        })}
      </div>

      <div className="p-6 bg-gray-50 flex gap-4">
        <button onClick={reset} className="w-14 h-14 flex items-center justify-center bg-white border border-gray-200 rounded-2xl shadow-sm active:scale-95 transition-transform">
          <RotateCcw size={20} className="text-gray-600" />
        </button>
        <button onClick={handleShare} className="flex-1 h-14 bg-ios-green text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
          <Share2 size={20} /> Compartilhar
        </button>
      </div>

      <SponsorModal 
        isOpen={isSponsorModalOpen} 
        onClose={() => setIsSponsorModalOpen(false)} 
        totalBill={grandTotalOriginal} 
      />
    </div>
  );
};