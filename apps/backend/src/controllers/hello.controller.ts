import { Request, Response } from 'express'

export const helloController = async (request: Request, response: Response) => {
    response.send(
        JSON.stringify([
            { title: 'Hello World', description: 'This is my first post.' },
            { title: 'Me Again', description: 'This is my second post.' },
        ])
    )
}
