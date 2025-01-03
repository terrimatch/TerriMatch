import React, { useState } from 'react';
import { Heart, MessageCircle, Users, Shield, Mail, ChevronDown } from 'lucide-react';

function TerriMatch() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqItems = [
    {
      question: "Cum funcționează TerriMatch?",
      answer: "TerriMatch folosește un algoritm avansat pentru a găsi persoane compatibile în funcție de interesele și preferințele tale. După ce creezi un profil, vei primi sugestii de potriviri și poți începe să conversezi cu persoanele care îți plac."
    },
    {
      question: "Este gratuit?",
      answer: "Da, serviciul de bază TerriMatch este complet gratuit. Poți să creezi profil, să vezi potriviri și să conversezi fără costuri."
    },
    {
      question: "Este sigur să folosesc TerriMatch?",
      answer: "Siguranța utilizatorilor noștri este prioritatea numărul unu. Folosim verificare în mai multe etape și moderare activă pentru a asigura o experiență sigură și plăcută."
    },
    {
      question: "Cum îmi pot șterge contul?",
      answer: "Poți șterge contul oricând din setările botului de Telegram folosind comanda /delete. Toate datele tale vor fi șterse permanent."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
      {/* Header Section rămâne neschimbată */}
      <header className="container mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <Heart className="inline-block w-16 h-16 text-blue-500" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">TerriMatch</h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300">
          Descoperă conexiuni autentice în comunitatea noastră
        </p>
        <a href="https://t.me/terrimatch_bot" 
           className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-full text-lg inline-block">
          Începe Conversația
        </a>
      </header>

      {/* Secțiunea de galerie */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Comunitatea Noastră</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Aici vom adăuga placeholder images pentru galerie */}
          <div className="aspect-square bg-blue-800 rounded-lg overflow-hidden">
            <img src="/api/placeholder/300/300" alt="Community Member" className="w-full h-full object-cover" />
          </div>
          {/* Repetă pentru mai multe imagini */}
        </div>
      </section>

      {/* Funcționalități rămân neschimbate */}

      {/* Secțiunea FAQ nouă */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Întrebări Frecvente</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-blue-900 bg-opacity-20 rounded-xl overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-semibold">{item.question}</span>
                <ChevronDown className={`transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-300">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Secțiunea de contact */}
<section className="container mx-auto px-4 py-16">
  <h2 className="text-3xl font-bold text-center mb-12">Contact</h2>
  <div className="text-center">
    <Mail className="w-12 h-12 mx-auto mb-4 text-blue-400" />
    <p className="text-xl mb-4">Ai întrebări? Contactează-ne la:</p>
    <a href="mailto:terrimatch.contact@gmail.com" className="text-blue-400 hover:text-blue-300">
      terrimatch.contact@gmail.com
    </a>
  </div>
</section>

      <footer className="container mx-auto px-4 py-8 text-center text-gray-400">
        <p>© 2024 TerriMatch. Toate drepturile rezervate.</p>
      </footer>
    </div>
  );
}

export default TerriMatch;