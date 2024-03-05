import { Timestamp } from "@firebase/firestore"

export interface Todo {
    value: string
    createdAt?: Timestamp
    edited?: boolean
    editedAt?: Timestamp
    deleted?: boolean
    deletedAt?: Timestamp
    completed?: boolean
    completedAt?: Timestamp
}