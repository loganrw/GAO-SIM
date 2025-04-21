export interface Card {
    classes: string[]
    cost_memory: number
    cost_reserve: number
    durability: number
    editions: [
        {
            card_id: string
            uuid: string,
            image: string,
            flavor: string,
        }
    ]
    effect: string
    effect_html: string
    effect_raw: string
    element: string
    flavor: string
    image_link: string,
    image: Blob
    legality: string
    level: number
    life: number
    name: string
    power: number
    speed: boolean
    subtypes: string[]
    types: string[]
    uuid: string
}