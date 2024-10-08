import { URL_CONF, API_KEY_CONF } from './config.js'

const { URL } = URL_CONF
const { API_KEY } = API_KEY_CONF
// const API_KEY = process.env.API_KEY

// weather data output==================================================
const out = document?.querySelector('.weather-right')
const divImg = out.querySelector('#weather-current')
const temp = out.querySelector('#weather-temp')
const nameCity = out.querySelector('#weather-city')
const backgroundImg = document.querySelector('#background-img')
const valInpCity = document.querySelector('#weather-choose')
const timePerSecondElement = document.getElementById('time-per-second')
const dateElement = document.getElementById('date')
const errorWindow = document.querySelector('#error-window')

// Элементы popup окна -----------------------------------------------------------
const nameTask = document.querySelector('#taskTitle')
const containerTask = document.querySelector('#taskList')

const buttonAddTask = document.querySelector('#taskAddButton')

const buttonDelTask = document.querySelector('#taskDelButton')

const taskTitleHelp = document.querySelector('#taskTitleHelp')

let popupBg = document.querySelector('#popup-tasks-popup-bg')
let popup = document.querySelector('.popup')
let openPopupButtons = document.querySelector('#open-popup-tasks')
let closePopupButton = document.querySelector('.close-popup')
// ---------------------------------------------------------------------
let cityChoose = ''
let dataWeather

// Динамическая смена обоев в зависимости от текущего времени ===========
const dataUrlImgBgd = {
	morning: 'image/bg/01.jpg',
	day: 'image/bg/02.jpg',
	evening: 'image/bg/03.jpg',
	night: 'image/bg/04.jpg',
}

// Вызовем функцию для сметы изображения bgd
function timeShowBgd() {
	const time = new Date().getHours()

	if (0 <= time && time < 6) backgroundImg.src = dataUrlImgBgd.morning
	if (6 <= time && time < 12) backgroundImg.src = dataUrlImgBgd.day
	if (12 <= time && time < 18) backgroundImg.src = dataUrlImgBgd.evening
	if (18 <= time && time < 23.999) backgroundImg.src = dataUrlImgBgd.night
}
timeShowBgd()

// Using the Geolocation API ===============================================
function getLocation() {
	if (navigator.geolocation) {
		navigator.permissions.query({ name: 'geolocation' }).then(result => {
			if (result.state === 'granted') {
				navigator.geolocation.getCurrentPosition(fetchWeather, showError, {})
			} else if (result.state === 'denied') {
				fetchWeather()
			}
			// Don't do anything if the permission was denied.
		})
	} else {
		console.log('Геолокация не поддерживается вашим браузером.')
	}
}
getLocation()

// Выбор города ============================================================
function weatherChoose() {
	cityChoose = valInpCity.value.replace(/[^a-zA-Zа-яА-Я]+/g, '').toLowerCase()
	fetchWeather(undefined, cityChoose)
}

valInpCity.addEventListener('change', weatherChoose)

// Запрос погоды ===========================================================
function fetchWeather(position, city) {
	let lat = position?.coords?.latitude
	let lon = position?.coords?.longitude

	if (
		city === '' ||
		(city === undefined && (lat === undefined || lon === undefined))
	) {
		city = 'краснодар' // lat = 45.04484 lon = 38.97603  default Краснодар ***
		showPosWeatForecast(city, lat, lon)
	} else {
		showPosWeatForecast(city, lat, lon)
	}
}

async function showPosWeatForecast(city, lat, lon) {
	if (city === undefined) city = ''
	const paramFetchWeather = `weather?q=${city}&lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${API_KEY}`

	try {
		const resWeather = await fetch(URL + paramFetchWeather)
		dataWeather = await resWeather.json()
	} catch (error) {
		console.error(error)
	}

	// Кладем данные города в local store
	if (dataWeather.name !== undefined)
		localStorage.setItem('cityHome', dataWeather.name)

	showWeather(dataWeather)
}

// Показываем данные =======================================================
function showWeather(dataWeather) {
	let sizeIcon = 2
	divImg.innerHTML = `<img class='current-weather-icon' src='https://openweathermap.org/img/wn/${dataWeather.weather[0].icon}@${sizeIcon}x.png' alt='Image Watcher'>`
	temp.innerHTML = Math.round(dataWeather.main.temp) + '&deg;'
	nameCity.innerHTML = 'Погода в ' + dataWeather.name
}

// convert date =============================================================
function dateConvert(dateObj, format, domElement) {
	const daysOfWeek = [
		'воскресенье',
		'понедельник',
		'вторник',
		'среда',
		'четверг',
		'пятница',
		'суббота',
	]
	const months = [
		'января',
		'февраля',
		'марта',
		'апреля',
		'мая',
		'июня',
		'июля',
		'августа',
		'сентября',
		'октября',
		'ноября',
		'декабря',
	]
	let converted_time = ''

	if (dateObj === undefined && domElement) {
		const dateDef = new Date()
		const day = String(dateDef.getDate()).padStart(2, '0')
		const month = months[dateDef.getMonth()]
		const dayOfWeek = daysOfWeek[dateDef.getDay()]
		const year = dateDef.getFullYear()
		const date = ('0' + dateDef.getDate()).slice(-2)

		switch (format) {
			case 'DD':
				converted_time = `${day} ${month}, ${dayOfWeek}`
				break
			case 'YYYY-MM-DD':
				converted_time = `${date} ${month} ${year}`
				break
		}
	} else if (dateObj !== undefined && domElement) {
		// time on second
		let hours = ('0' + dateObj?.getHours()).slice(-2)
		let minutes = ('0' + dateObj?.getMinutes()).slice(-2)
		let seconds = ('0' + dateObj?.getSeconds()).slice(-2)

		switch (format) {
			case 'YYYY-MMM-DD DDD':
				converted_time = `${hours} : ${minutes} : ${seconds}`
				break
		}
	} else {
		showError(
			'Не могу установить время. Возможно, вы не дали разрешение на показ геолокации'
		)
		alert(
			'Не могу установить время. Возможно, вы не дали разрешение на показ геолокации'
		)
	}

	// to show it I used innerHTMl
	domElement.innerHTML = converted_time
}

// show date
dateConvert(undefined, 'DD', dateElement)

// show time on second
setInterval(function () {
	let date = new Date()
	let format = 'YYYY-MMM-DD DDD'
	dateConvert(date, format, timePerSecondElement)
}, 1000)

// popup Tasks ===================================================================
// Скрытие/ показ попап окна при клике на крестик --------------------------------
function togglePopup() {
	popupBg.classList.toggle('active')
	popup.classList.toggle('active')
	nameTask.focus()
}

closePopupButton.addEventListener('click', togglePopup)
openPopupButtons.addEventListener('click', togglePopup)

// Прячем попап окно на чистом js при клике на фон ------------------------------
function closePopupWindow(e) {
	const itsPopupBg = e.target == popupBg || popupBg.contains(e.target)
	const its_btnOpenPopupButtons = e.target == openPopupButtons
	const popupActive = popupBg.classList.contains('active')
	if (!itsPopupBg && !its_btnOpenPopupButtons && popupActive) {
		// togglePopup() //включить закратие
	}
}

document.addEventListener('click', closePopupWindow)

// Добавить задачу ------------------------------------------------------------
function addTask() {
	taskTitleHelp.innerText = ''

	if (!nameTask.value) {
		taskTitleHelp.innerText = 'Это поле не должно быть пустым.'
		taskTitleHelp.style.color = 'red'
		return
	}

	const task = document.createElement('div')

	task.classList.add('task')

	task.innerHTML = `
		<div class="task-body">
		<div class="task-body__task-check">
				<input type="checkbox"
							id="taskCheck"
							name="taskCheck" />
				
		</div>
				<div class="task-body__title" id="task-body-title">
					<span>${nameTask.value}</span>
				</div>
				<button type="button" class="task-body__close-btn close-task-btn">
								<span>удалить</span>
				</button>
			</div>

			`

	containerTask.appendChild(task)

	task?.querySelector('input').addEventListener('change', e => {
		task.classList.toggle('checked', e.currentTarget.checked)
	})

	nameTask.value = ''
	taskTitleHelp.innerText = ''
}

buttonAddTask.addEventListener('click', addTask)

// Удаление задачи --------------------------------------------------------------
function delTask(e) {
	if (e.target.closest('.close-task-btn')) e.target.closest('.task').remove()
}

containerTask.addEventListener('click', delTask)

// Добавление новых задач осуществляется при нажатии на «Enter» -------------------
function addTaskOnEnter(e) {
	if (e.key == 'Enter') addTask
}

// Отслеживаем нажатие Enter
popupBg.addEventListener('keydown', addTaskOnEnter)

// Удалить задачу по клику -------------------------------------------------------
function delAllTask(e) {
	const checkboxTask = containerTask?.querySelectorAll('.task.checked')

	if (checkboxTask.length > 0) {
		checkboxTask.forEach(el => el.remove())
	}
}

buttonDelTask.addEventListener('click', delAllTask)

// Handling Errors and Rejections  ============================================
function showError(error) {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			errorWindow.innerHTML = 'Пользователь не предоставил доступ к геолокации.'
			alert(
				'Не могу установить ваше местоположение. Возможно, вы не дали разрешение на показ геолокации. Показ геолокации можно установить в строке адреса сайта, слева от адресной строки.'
			)

			break
		case error.POSITION_UNAVAILABLE:
			errorWindow.innerHTML = 'Информация о местоположении недоступна.'
			alert(
				'Информация о местоположении недоступна. Проверьте разрешение на показ геолокации. Показ геолокации можно установить в строке адреса сайта, слева от адресной строки.'
			)
			break
		case error.TIMEOUT:
			errorWindow.innerHTML =
				'Время ожидания запроса на получение местоположения пользователя истекло.'
			alert(
				'Время ожидания запроса на получение местоположения пользователя истекло.'
			)
			break
		case error.UNKNOWN_ERROR:
			errorWindow.innerHTML = 'Произошла неизвестная ошибка.'
			alert('Произошла неизвестная ошибка.')
			break
	}
}
