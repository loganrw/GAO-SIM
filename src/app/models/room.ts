export interface Room {
    name: string,
    clients: number,
    createdAt: string,
    locked: boolean,
    private: boolean,
    processId: string,
    roomId: string,
    unlisted: boolean
}