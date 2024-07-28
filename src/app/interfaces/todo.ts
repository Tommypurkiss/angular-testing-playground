import { Timestamp } from "@firebase/firestore"

export interface Todo {
    value: string
    id?: string
    createdAt?: Timestamp
    edited?: boolean
    editedAt?: Timestamp
    deleted?: boolean
    deletedAt?: Timestamp
    completed?: boolean
    completedAt?: Timestamp

    //offline fields
    userId?: string
    offlineId?: string
}

// export interface OfflineTodo {
//     value: string
//     userId: string
//     id?: string
// }