'use client';

import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Does the server run 24/7?',
    answer:
      'Yes, our data center servers operate 24 hours a day, 7 days a week to ensure uninterrupted service.',
  },
  {
    question: 'What is the total storage capacity?',
    answer:
      'Our current setup includes 2.5 TB of high-performance storage, optimized for reliability and speed.',
  },
  {
    question: 'Is data backup available?',
    answer:
      'Yes, we perform automated backups regularly to ensure your data is safe and recoverable.',
  },
  {
    question: 'Can I access the server remotely?',
    answer:
      'Yes, remote access is available for authorized users with secure login credentials.',
  },
  {
    question: 'Is technical support available?',
    answer:
      'Absolutely. Our technical team is available during college hours to assist you with any issues or queries.',
  },
  {
    question: 'Which operating system is used on the servers?',
    answer:
      'Our servers primarily run on Linux (Ubuntu Server), known for its stability and performance.',
  },
  {
    question: 'What virtualization platform is used?',
    answer:
      'We use Proxmox VE as our primary virtualization solution, offering both containers and full VM support.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-black px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex justify-between items-center text-left"
              >
                <span className="text-lg font-medium">{faq.question}</span>
                <span className="text-xl font-bold">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-700 border-t border-gray-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
