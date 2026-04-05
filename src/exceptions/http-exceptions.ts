import { HTTPException } from 'hono/http-exception'

export class NotFoundError extends HTTPException {
  constructor(resource: string) {
    super(404, { message: `${resource} not found` })
  }
}

export class BadRequestError extends HTTPException {
  constructor(message: string) {
    super(400, { message })
  }
}
