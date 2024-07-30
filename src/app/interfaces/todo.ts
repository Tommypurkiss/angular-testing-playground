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
    userId?: string

}

export interface OfflineTodo {
    value: string
    id?: number
    completed?: boolean
    edited?: boolean
    userId?: string
}