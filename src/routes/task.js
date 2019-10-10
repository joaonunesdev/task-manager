const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

/**
 * Salva uma task.
 * 
 * @name Tasks Cadastro 
 * @route {POST} /tasks
 * @authentication Essa rota requer autenticação JWT e retorna 400 se falhar.
 */
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body, //spread operator
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});


/**
 * Recupera as tasks de um usuário.
 * 
 * @name Tasks do Usuário 
 * @route {GET} /tasks?completed=false
 * @route {GET} /tasks?limit=5&skip=0
 * @route {GET} /tasks?sortBy=createdAt:desc
 * @authentication Essa rota requer autenticação JWT e retorna 400 se falhar.
 */
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
});

/**
 * Recupera uma task pela id.
 * 
 * @param id Indenticador único da task.
 * @name Tasks Cadastro 
 * @route {POST} /tasks/id
 * @authentication Essa rota requer autenticação JWT e retorna 400 se falhar.
 */
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        
        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.send(500).send();
    }

});

/**
 * Atualiza uma task.
 * 
 * @name Tasks Atualização 
 * @route {PATCH} /tasks
 * @authentication Essa rota requer autenticação JWT e retorna 400 se falhar.
 */
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)); 

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'} );
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }

});

/**
 * Remove uma task pela id.
 * 
 * @name Tasks Remoção 
 * @param id Indenticador único da task.
 * @route {DELETE} /tasks/id
 * @authentication Essa rota requer autenticação JWT e retorna 400 se falhar.
 */
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;