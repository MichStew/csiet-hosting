import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

    return (
    <body class='bg-gradient-to-br from-cream to-orange-50 text-gray-800 leading-relaxed min-h-screen'>
    <header class='bg-white bg-opacity-95 backdrop-blur-md shadow-lg sticky top-0 z-5'>

        <div class='max-w-7xl mx-auto px-5'>
            <nav class='flex flex-col md:flex-row justify-between item-center py-4 gap-4'>
                <div class='flex items-center gap-4'>
                    {/*'<img src=''>' Come back here to add log and fix width issues, good start tho */}
                    <div class='text-2xl font-bold text-burgundy'>
                        CSIET
                    </div>
                </div>

                <div class='flex gap-4 flex-wrap justify-center'>
                    <a href='#'
                       className='px-6 py-3 border-2 border-burgundy text-burbgundy rounded-full font-semibold transition-all duration-300 hover:bg-burgundy hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-burgundy/30'>
                        Company Login
                    </a>
                    <a href='#'
                       className='px-6 py-3 border-2 border-burgundy text-burbgundy rounded-full font-semibold transition-all duration-300 hover:bg-burgundy hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-burgundy/30'>
                        Update Profile
                    </a>
                    <a href='#'
                       className='px-6 py-3 border-2 border-burgundy text-burbgundy rounded-full font-semibold transition-all duration-300 hover:bg-burgundy hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-burgundy/30'>
                        Contact Us
                    </a>
                </div>
            </nav>
        </div>
    </header>
    </body>
)
}

export default App