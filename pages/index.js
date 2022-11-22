import Link from 'next/link'
import Typewriter from 'typewriter-effect';

function Encrypt() {




  return (

    <div className='w-screen min-h-screen md:p-20 p-6 flex flex-col justify-center items-center bg-gray-300'>
        <div className='flex flex-col justify-center items-center'>
         
           
          
            <div className='mb-6 flex flex-col justify-center items-center'>
                <h3 className='text-4xl text-blue-400 font-extrabold italic'>Welcome</h3>
                <h4 className='text-3xl text-red-400 font-bold italic'>to</h4>
                <h1 className='text-6xl text-gray-900 font-extrabold mb-6'>Computerized Data Cryptographic System</h1>
                <p className='text-4xl  text-white font-extrabold'>A platform for <span className='text-red-400'>ENCODING </span> 
                     and <span className='text-red-400'>DECODING</span>
                </p>
            </div>
            <Link href='/encrypt'><a className="px-4 md:px-6 py-2 md:py-4 bg-blue-400 hover:bg-blue-200 rounded-lg  text-white font-bold">Continue</a></Link>
        </div>

    </div>
  )
}

export default Encrypt
