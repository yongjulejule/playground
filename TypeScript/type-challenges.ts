import type { Equal, Expect } from '@type-challenges/utils'

type MyPick<T, K extends keyof T> = {
	[P in K]: T[P]
}

type MyReadonly<T> = {
	readonly [K in keyof T] : T[K]
}

type cases = [
  Expect<Equal<MyReadonly<Todo1>, Readonly<Todo1>>>,
]

interface Todo1 {
  title: string
  description: string
  completed: boolean
  meta: {
    author: string
  }
}
