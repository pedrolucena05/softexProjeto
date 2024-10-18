// Importando o Express
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();


// Definindo a porta
const PORT = 3000;

// Conectando ao banco de dados automatebd
const db = mysql.createConnection({
    host: 'localhost', // ou o host do seu banco de dados
    user: 'root', // seu usuário do banco de dados
    password: 'admin', // sua senha do banco de dados
    database: 'automatebd' // nome do banco de dados
});

// Verificando a conexão
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados automatebd');
});

// Middleware para servir arquivos estáticos (opcional para CSS/JS/imagens)
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true })); 

// Configurando EJS como motor de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Define o diretório das views

// Rota 1: Página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});



// Cadastro
app.get('/cadastro', (req, res) => {
    const rotaAnterior = req.headers.referer || '/';

    res.render('cadastro', { rotaAnterior });
});


// Home Administrador
app.get('/administrador', (req, res) => {

    

    // Query SQL para selecionar todas as empresas
    const sql = 'SELECT * FROM empresas';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao recuperar empresas:', err);
            return res.status(500).send('Erro ao recuperar empresas.');
        }
        // Renderiza a página HTML passando os dados das empresas
        res.render('admHome', { empresas: results });
    });
});


app.post('/navigate', (req, res) => {
    // Log para ver os dados recebidos
    console.log(req.body); 

    const { email, password } = req.body; // Obtém email e password do formulário

    // Aqui você pode implementar a lógica de autenticação, por exemplo
    if (email === 'admin@example.com' && password === 'senha123') { // Exemplo simples de validação
        res.redirect('/administrador');
    } else {
        res.redirect('/?error=1');// Redireciona para a página inicial se a autenticação falhar
    }
});

// Rota para logout
app.get('/logout', (req, res) => {
    // Aqui você pode adicionar qualquer lógica de logout necessária
    // Por exemplo, remover informações do usuário da sessão, etc.
    
    // Redireciona para a página inicial com um parâmetro de sucesso
    res.redirect('/?success=1');
});

// Rota para tratar o envio do formulário de cadastro
app.post('/submit-cadastro', (req, res) => {
    const { nome, cnpj, email, endereco, telefone, complemento, senha, cidade, estado } = req.body;

    const documento = null; // ou você pode definir um valor se necessário
    const status = 1;

    // Query SQL para inserir os dados na tabela 'empresas'
    const sql = `
        INSERT INTO empresas (empresa, documento, status, telefone, email, cnpj, endereco, complemento, estado, cidade, senha) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Executando a query com os dados fornecidos no formulário
    db.query(sql, [nome, documento, status, telefone, email, cnpj, endereco, complemento, estado, cidade, senha], (err, result) => {
        if (err) {
            console.error('Erro ao inserir dados:', err);
            return res.send('Erro ao cadastrar empresa.');
        }
        console.log('Empresa cadastrada com sucesso:', result);
        const previousRoute = req.body.previousRoute || '/'; // Pega a rota anterior ou redireciona para a raiz
        res.redirect(previousRoute);
    });
});

// Rota para listar empresas
app.get('/listar-empresas', (req, res) => {
    // Query SQL para selecionar todas as empresas
    const sql = 'SELECT * FROM empresas';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao recuperar empresas:', err);
            return res.status(500).send('Erro ao recuperar empresas.');
        }
        // Renderiza uma página HTML passando os dados das empresas
        res.render('empresas', { empresas: results });
    });
});

// Servidor ouvindo na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
