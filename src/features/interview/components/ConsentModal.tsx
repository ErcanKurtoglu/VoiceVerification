"use client";

import React from "react";
import { Shield, X, CheckCircle2 } from "lucide-react";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Başlık */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">
              KVKK & Gizlilik Aydınlatma Metni
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metin İçeriği */}
        <div className="py-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Bu araştırma, yeni nesil dijital ürünlerin pazar uyumunu (Product-Market Fit) ve sektör profesyonellerinin ihtiyaçlarını belirlemek amacıyla yürütülmektedir.
          </p>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              1. Ses Verisinin İşlenme Amacı
            </h4>
            <p className="text-slate-400 pl-5">
              Paylaştığınız ses kayıtları <strong>yalnızca</strong> yapay zeka modelleri aracılığıyla metne dönüştürülmek ve araştırma hipotezlerimizi doğrulamak üzere analiz edilmek amacıyla kullanılır. Ses verisi asla biyometrik kimlik doğrulama, ses klonlama veya pazarlama amacıyla 3. taraflarla paylaşılmaz.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              2. Kullanıcı Kontrolü & Geri Çekme Hakkı
            </h4>
            <p className="text-slate-400 pl-5">
              Ses kaydınızı tamamladıktan sonra sisteme gönderilmeden önce dilediğiniz gibi dinleyebilir, silebilir veya dilerseniz ses yerine <strong>yazılı yanıt</strong> vermeyi tercih edebilirsiniz.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              3. Veri Saklama ve Anonimleştirme
            </h4>
            <p className="text-slate-400 pl-5">
              Toplanan veriler analiz tamamlandıktan sonra sektör raporunda yalnızca anonimleştirilmiş içgörüler ve istatistikler olarak yer alır. Ham ses dosyaları saklama süresi sonunda otomatik olarak sistemden silinir.
            </p>
          </div>
        </div>

        {/* Buton */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all"
          >
            Anladım & Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
