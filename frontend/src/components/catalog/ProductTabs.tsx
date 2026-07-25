'use client';

import { useState } from 'react';
import { mdToHtml } from '@/lib/utils';

interface ProductTabsProps {
  description: string;
  specs: Record<string, string | number>;
  pdfUrl?: string | null;
  pdfName?: string;
}

export default function ProductTabs({ description, specs, pdfUrl, pdfName }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'pdf'>('description');

  const tabs = [
    { key: 'description' as const, label: 'Описание', show: true },
    { key: 'specs' as const, label: 'Характеристики', show: Object.keys(specs).length > 0 },
    { key: 'pdf' as const, label: 'PDF', show: !!pdfUrl },
  ].filter(t => t.show);

  if (tabs.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="py-6" role="tabpanel">
        {activeTab === 'description' && (
          <div className="prose prose-sm max-w-none text-text/80">
            <div dangerouslySetInnerHTML={{ __html: mdToHtml(description || 'Описание отсутствует.') }} />
          </div>
        )}

        {activeTab === 'specs' && (
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(specs).map(([key, value]) => (
                <tr key={key} className="border-b border-gray-100">
                  <td className="py-2 font-medium text-text w-1/3">{key}</td>
                  <td className="py-2 text-muted">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'pdf' && pdfUrl && (
          <div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-btn bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Скачать PDF{pdfName ? ` (${pdfName})` : ''}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
