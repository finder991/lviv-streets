const path = require('path')
const express = require('express')
const Datastore = require('@seald-io/nedb')

const app = express()
const port = process.env.PORT || 3000

const streets = new Datastore({ filename: path.join(__dirname, 'db', 'streets.db'), autoload: true })
const houses = new Datastore({ filename: path.join(__dirname, 'db', 'houses.db'), autoload: true })

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (request, response, next) => {
    try {
        const list = await streets.findAsync({}).sort({ name: 1 })
        response.render('streets', { title: 'Вулиці міста Львова', streets: list })
    } catch (err) {
        next(err)
    }
})

app.get('/streets/:id', async (request, response, next) => {
    try {
        const street = await streets.findOneAsync({ _id: request.params.id })
        if (!street) {
            return response.status(404).render('error', {
                title: 'Вулицю не знайдено',
                message: 'Вулиці з таким ідентифікатором у базі даних немає.'
            })
        }
        const list = await houses.findAsync({ street: street._id }).sort({ number: 1 })
        response.render('houses', {
            title: 'Будинки: ' + street.name,
            street: street,
            houses: list
        })
    } catch (err) {
        next(err)
    }
})

app.use((err, request, response, next) => {
    console.log(err)
    response.status(500).render('error', {
        title: 'Помилка',
        message: 'Виникла помилка під час обробки запиту.'
    })
})

app.listen(port, () => {
    console.log(`Сервер почав прослуховувати порт ${port}…`)
})
