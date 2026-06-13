// Auth API response shapes — mirrors server response contracts from Stories 2.1–2.3

export interface LoginSuccessResponse {
  ok: true
}

export interface LogoutSuccessResponse {
  ok: true
}

export interface ApiErrorResponse {
  statusCode: number
  error: string
  message: string
}
