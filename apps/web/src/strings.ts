// All user-facing Uzbek Cyrillic UI strings go here.
// DO NOT add Latin Uzbek here — will fail check-uz-strings.ts test.
// Use Маҳалла, Бугун, Кеча, Соат, Қидириш — never the Latin equivalents.

export const strings = {
  login: {
    title: 'Маҳалла Овози',
    subtitle: 'Тизимга кириш',
    usernameLabel: 'Фойдаланувчи номи',
    usernamePlaceholder: 'Фойдаланувчи номи',
    passwordLabel: 'Парол',
    passwordPlaceholder: 'Парол',
    usernameRequired: 'Фойдаланувчи номини киритинг',
    passwordRequired: 'Паролни киритинг',
    submitButton: 'Кириш',
    errorInvalidCredentials: 'Фойдаланувчи номи ёки парол нотўғри',
    errorRateLimit: 'Кириш уринишлари сони ошиб кетди. Бир оздан кейин уриниб кўринг',
    errorUnknown: 'Хатолик юз берди. Кейинроқ уриниб кўринг',
  },
  pages: {
    dashboardPlaceholder: 'Бошқарув панели тайёрланмоқда',
    opsPlaceholder: 'Оператор панели тайёрланмоқда',
  },
  app: {
    title: 'Маҳалла Овози',
    unsupportedScreen: 'Маҳалла Овози фақат компьютер экранида ишлайди',
  },
} as const
