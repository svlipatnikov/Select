# Select

Посмотреть и "пощупать" компонент можно тут: https://svlipatnikov.github.io/Select

# Установка

- Скачать проект:

* SSH: git@github.com:svlipatnikov/Select.git
* HTTPS:https://github.com/svlipatnikov/Select.git

- Установить зависимости: `npm install`
- Запустить локально: `npm start`

# Описание компонента

## Пропы

- placeholder - string -плейсхолдер
- selected - object - текущее выбранное значение (или массив значений, если выбран multiple)
- options - array - массив опций
- onSelect - func -функция возвращающая выбранное значение (или массив, если выбран multiple)
- multiple - bool - если true, селект будет выбирать нескользо значений
- onServerSearch - func - функция поиска значения на сервере, возвращает промис. Если не задана или промис отклонен, то поиск ведется на клиенте,
- searchDelay - number - количество миллисикунд debounced-функции,

## Опции

- id - number - улникальный идентификатор опции
- value: - string - краткое название опции, выводится в инпут, если выбран multiple
- label: - string - полное зазвание опции, выводится в попап-список опций
