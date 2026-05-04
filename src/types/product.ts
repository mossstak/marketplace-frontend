export type ProductDetails = {
    id: string
    productName: string
    productDescription: string | null
    category: number | null
    roastLevel: string | null
    coffeeProcess: string | null
    origin: string | null
    region: string | null
    producer: string| null
    varietal: string | null
    altitude: number | null
    tastingNotes: string | null
    roastDate: string | null
    variants: { price: number | null, size:number | null, quantity:number | null }[]
    seller:{sellerId:string}
    images: { imageUrl: string | null, isPrimary: boolean | null}[]
}