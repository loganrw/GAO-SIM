export interface Card {
    classes: string[]
    cost_memory: number
    cost_reserve: number
    durability: number
    editions: [
        {
            card_id: string
            image: string
            uuid: string
        }
    ]
    effect: string
    effect_html: string
    effect_raw: string
    element: string
    flavor: string
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