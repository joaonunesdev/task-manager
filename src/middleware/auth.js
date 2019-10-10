const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Responsável por interceptar requisições e verificar a validade do token. 
 * 
 * A requisição prossegue [next()] quando o usuário é encontrado e o token fornecido existe na lista dos tokens do referido usuário.
 * 
 * O token e o usuário são adicionados à requisição [req] caso o token seja válido.
 * 
 * @param {*} req - O token e o User são adicionados à requisição quando o token é válido. 
 * @param {*} res
 * @param {*} next - É chamado quando o token é válido (sinaliza que o fluxo da requisição deve prosseguir normalmente).
 */
const auth = async (req, res, next) => {
    try {
        
        const token = req.header('Authorization').replace('Bearer ', '');               // Isola o token enviado na requisição
        const decoded = jwt.verify(token, process.env.JWT_SECRET);                      // Decodifica o token e recupera a _id do usuário que foi utilizada para gerar o token
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });   // Busca por um usuário que possua a _id informada e que ainda possua o token na array de tokens 

        if (!user) {
            throw new Error();                                                          // Lança o erro 
        }

        req.token = token;                                                              // Adiciona o token na requisição
        req.user = user;                                                                // Adiciona o usuário na requisição
        next();                                                                         // A requisição prossegue 
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });                        // Captura o erro
    }
}

module.exports = auth;