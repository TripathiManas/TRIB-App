import React from 'react';

// --- Product Card Component ---
const ProductCard = ({ name, price, image, link }) => (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 group">
        <div className="overflow-hidden">
            <img 
                src={image} 
                alt={name} 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/1a1a1a/ffffff?text=Img+Error'; }}
            />
        </div>
        <div className="p-4">
            <h4 className="font-bold text-lg truncate">{name}</h4>
            <p className="text-green-400 font-semibold mt-1">{price}</p>
            <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center mt-4 bg-gray-800 hover:bg-green-500 hover:text-black text-white font-bold py-2 px-4 rounded-lg transition"
            >
                View Item
            </a>
        </div>
    </div>
);

// --- Shop Page Component ---
const Shop = () => {
    // For the MVP, we'll use a pre-defined list of products.
    const products = [
        { id: 1, name: 'Vintage 1998 France Jersey', price: '$120', image: 'https://placehold.co/400x400/1a1a1a/ffffff?text=Retro+France', link: '#' },
        { id: 2, name: 'TRIB Signature Scarf', price: '$45', image: 'https://placehold.co/400x400/1a1a1a/ffffff?text=TRIB+Scarf', link: '#' },
        { id: 3, name: 'Pro-Level Football Boots', price: '$250', image: 'https://placehold.co/400x400/1a1a1a/ffffff?text=Pro+Boots', link: '#' },
        { id: 4, name: 'Classic Leather Football', price: '$80', image: 'https://placehold.co/400x400/1a1a1a/ffffff?text=Classic+Ball', link: '#' },
    ];

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-8 mb-8 text-center border border-gray-800 bg-cover bg-center">
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">Retro Kit Drop!</h1>
                <p className="text-gray-200 mt-2 drop-shadow-md">This week's exclusive retro kits are now live.</p>
                <a href="#" className="mt-4 inline-block bg-green-500 text-black font-bold px-8 py-3 rounded-full hover:bg-green-400 transition">
                    Shop The Collection
                </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => <ProductCard key={product.id} {...product} />)}
            </div>
        </div>
    );
};

export default Shop;
