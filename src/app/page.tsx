import Image from 'next/image'
import Heading from '@/components/Heading'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eae8e0] font-sans dark:bg-black">
      <Heading title={'Hello World'} description={'Marketplace'} />
    </div>
  )
}
