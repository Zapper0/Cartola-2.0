//arquivo de rotas utilizando o express router

//imports 
import express from 'express'
const router = express.Router()
import path from 'path'
import flash from 'connect-flash'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { initializeApp } from "firebase/app";
import { getStorage, uploadBytes, ref as sRef, getDownloadURL } from 'firebase/storage'
import { child, get, getDatabase, ref, set, update } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, inMemoryPersistence, browserSessionPersistence } from "firebase/auth";
import { async } from '@firebase/util';
import { url } from 'inspector';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
    apiKey: "AIzaSyD66ZB-5cEtmHMlwEmpsa9xLAJHegxyJZI",
    authDomain: "cartolachampagnat.firebaseapp.com",
    databaseURL: "https://cartolachampagnat-default-rtdb.firebaseio.com",
    projectId: "cartolachampagnat",
    storageBucket: "cartolachampagnat.appspot.com",
    messagingSenderId: "205064537268",
    appId: "1:205064537268:web:8e2a8a7c87e485a1f6c3e1",
    measurementId: "G-DS4813P7NN"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const auth = getAuth()
const storage = getStorage(app)
var mercadoAberto = false
var horaMercado
get(child(ref(db), 'horaMercado')).then((snapshot) => {
    horaMercado = snapshot.val()
})
get(child(ref(db), 'mercadoAberto')).then((snapshot) => {
    mercadoAberto = snapshot.val()
})

var user = {}

router

router.post('/login', async (req, res) => {
    var email = req.body.username + '@maristavirtual.org.br'
    var password = req.body.password
    var remember = Boolean(req.body.remember)
    var persistence
    if (remember) {
        persistence = browserSessionPersistence
    } else {
        persistence = inMemoryPersistence
    }
    setPersistence(auth, persistence).then(() => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('Logado')
                user[req.sessionID] = auth.currentUser
                res.redirect('/')
            })
            .catch((error) => {
                const errorCode = error.code
                const errorMessage = error.message
                console.log(`Error: ${errorCode} - ${errorMessage}`)
                if (errorCode == 'auth/wrong-password') {
                    req.flash('error', 'Usuário e/ou senha incorretos')
                    res.redirect('/login')
                } else if (errorCode == 'auth/user-not-found') {
                    req.flash('error', 'Usuário não encontrado')
                    res.redirect('/signup')
                } else if (errorCode == 'auth/invalid-email') {
                    req.flash('error', 'Email inválido')
                    res.redirect('/login')
                } else {
                    req.flash('error', `Erro desconhecido, contate o suporte:\n\nCódigo de erro: ${errorCode}\nMensagem: ${errorMessage}`)
                    res.redirect('/login')
                }
            })

    })
})

router.get('/signup', async (req, res) => {
    res.render('signup')
})

router.post('/signup', async (req, res) => {
    var email = req.body.newUsername + '@maristavirtual.org.br'
    var password = req.body.newPassword
    var remember = Boolean(req.body.remember)
    var persistence
    if (remember) {
        persistence = browserSessionPersistence
    } else {
        persistence = inMemoryPersistence
    }
    setPersistence(auth, persistence).then(() => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                user[req.sessionID] = auth.currentUser
                res.redirect('/')
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(`Error: ${errorCode} - ${errorMessage}`)
                if (errorCode == 'auth/email-already-in-use') {
                    req.flash('error', 'E-mail já cadastrado, faça login')
                    res.redirect('/login')
                } else if (errorCode == 'auth/invalid-email') {
                    req.flash('error', 'Email inválido')
                    res.redirect('/signup')
                } else if (errorCode == 'auth/weak-password') {
                    req.flash('error', 'Senha fraca, sua senha precisa ter pelo menos 8 dígitos')
                    res.redirect('/signup')
                } else {
                    req.flash('error', `Erro desconhecido, contate o suporte:\n\nCódigo de erro: ${errorCode}\nMensagem: ${errorMessage}`)
                    res.redirect('/signup')
                }
            })
    })
})

router.get('/logout', async (req, res) => {
    if (user[req.sessionID]) {
        delete user[req.sessionID]
        res.redirect('/login')
    }
})

router.get('/registerplayer', async (req, res) => {
    res.render('registerplayer')
})

router.post('/registerplayer', async (req, res) => {

    var nome = req.body.nome
    var equipe = req.body.equipe
    var numero = req.body.numero
    var pos = req.body.posicao
    var matricula = req.body.username
    var image = sRef(storage, 'images/' + req.files.foto.name)

    if (pos == 'Goleiro') {
        pos = 'goleiros'
    } else {
        pos = 'geral'
    }

    uploadBytes(image, req.files.foto.data).then((uploadResult) => {
        console.log('Foto enviada')
        getDownloadURL(image).then((url) => {
            get(child(ref(db), `lista/${pos}/${matricula}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    req.flash('error', 'Já existe um jogador com essa matrícula, em caso de erro, contate o suporte.')
                    res.redirect('/registerplayer')
                } else {
                    get(child(ref(db), `lista/provisorios/${pos}/${matricula}`)).then((snapshot) => {
                        if (snapshot.exists()) {
                            req.flash('error', 'Já existe um jogador com essa matrícula, em caso de erro, contate o suporte.')
                            res.redirect('/registerplayer')
                        } else {
                            set(child(ref(db), `lista/provisorios/${matricula}`), {
                                nome: nome,
                                equipe: equipe,
                                numero: numero,
                                foto: url,
                                pontos: '0',
                                username: matricula,
                                posicao: pos
                            }).then(() => {
                                console.log('Jogador cadastrado com sucesso!')
                                req.flash('success_msg', 'Jogador cadastrado com sucesso!')
                                res.redirect('/login')
                            }).catch((error) => {
                                const errorCode = error.code;
                                const errorMessage = error.message;
                                console.log(`Error: ${errorCode} - ${errorMessage}`)
                                req.flash('error', `Erro desconhecido, contate o suporte:\n\nCódigo de erro: ${errorCode}\nMensagem: ${errorMessage}`)
                                res.redirect('/registerplayer')
                            })
                        }
                    })
                }
            })
        })
    })
})

router.get('/', async (req, res) => {
    if (user[req.sessionID]) {
        console.log('Usuário logado acessou /\n')
        get(child(ref(db), `users/${user[req.sessionID].uid}/esquema`)).then((snapshot) => {
            if (snapshot.exists()) {
                res.render('main', { esquema: snapshot.val(), horaMercado: horaMercado, mercadoAberto: mercadoAberto })
            } else {
                set(ref(db, `users/${user[req.sessionID].uid}`), {
                    'esquema': {
                        'pivo': {
                            'foto': 'https://www.business2community.com/wp-content/plugins/wp-user-avatars/wp-user-avatars/assets/images/mystery.jpg',
                            'nome': '',
                            'username': '',
                            'pontos': 0,
                            'numero': '',
                            'equipe': '',
                        },
                        'alaesquerda': {
                            'foto': 'https://www.business2community.com/wp-content/plugins/wp-user-avatars/wp-user-avatars/assets/images/mystery.jpg',
                            'nome': '',
                            'username': '',
                            'pontos': 0,
                            'numero': '',
                            'equipe': '',
                        },
                        'aladireita': {
                            'foto': 'https://www.business2community.com/wp-content/plugins/wp-user-avatars/wp-user-avatars/assets/images/mystery.jpg',
                            'nome': '',
                            'username': '',
                            'pontos': 0,
                            'numero': '',
                            'equipe': '',
                        },
                        'fixo': {
                            'foto': 'https://www.business2community.com/wp-content/plugins/wp-user-avatars/wp-user-avatars/assets/images/mystery.jpg',
                            'nome': '',
                            'username': '',
                            'pontos': 0,
                            'numero': '',
                            'equipe': '',
                        },
                        'goleiro': {
                            'foto': 'https://www.business2community.com/wp-content/plugins/wp-user-avatars/wp-user-avatars/assets/images/mystery.jpg',
                            'nome': '',
                            'username': '',
                            'pontos': 0,
                            'numero': '',
                            'equipe': '',
                        }
                    },
                    'matricula': user[req.sessionID].email.split('@')[0],
                    'pontos': 0,
                }).then(() => {
                    console.log('Esquema criado')
                    res.redirect('/')
                }).catch((error) => {
                    req.flash('error', `Erro desconhecido, contate o suporte\n\nCódigo de erro: ${error.code}\nMensagem: ${error.message}`)
                    console.log(error)
                })
            }
        })
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }

})

router.get('/perfil', async (req, res) => {
    if (user[req.sessionID]) {
        console.log('Usuário logado acessou /perfil\n')
        get(child(ref(db), `users/${user[req.sessionID].uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                res.render('perfil', { perfil: snapshot.val() })
            } else {
                req.flash('error', 'Usuário não encontrado')
                res.redirect('/')
            }
        })
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

router.get('/goleiro', async (req, res) => {
    if (user[req.sessionID]) {
        console.log('Usuário logado acessou /goleiro\n')
        get(child(ref(db), `users/${user[req.sessionID].uid}/esquema/goleiro`)).then((snapshot) => {
            var esquema = snapshot.val()
            get(child(ref(db), `lista/goleiros`)).then((snapshot) => {
                var lista = snapshot.val()
                var itens = Object.keys(lista)
                for (var i in itens) {
                    for (var j in Object.keys(esquema)) {
                        if (lista[itens[i]]) {
                            if (String(lista[itens[i]].username) == String(esquema[Object.keys(esquema)[j]].username)) {
                                delete lista[itens[i]]
                            }
                        }
                    }
                }
                res.render('lista', { lista: lista, 'pos': 'goleiro' })
            })
        })
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

router.get('/alaesquerda', async (req, res) => {
    if (user[req.sessionID]) {
        console.log('Usuário logado acessou /alaesquerda\n')
        get(child(ref(db), `users/${user[req.sessionID].uid}/esquema`)).then((snapshot) => {
            var esquema = snapshot.val()
            get(child(ref(db), `lista/geral`)).then((snapshot) => {
                var lista = snapshot.val()
                var itens = Object.keys(lista)
                for (var i in itens) {
                    for (var j in Object.keys(esquema)) {
                        if (lista[itens[i]]) {
                            if (String(lista[itens[i]].username) == String(esquema[Object.keys(esquema)[j]].username)) {
                                delete lista[itens[i]]
                            }
                        }
                    }
                }
                res.render('lista', { lista: lista, 'pos': 'alaesquerda' })
            })
        })
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

router.get('/aladireita', async (req, res) => {
    if (user[req.sessionID]) {
        console.log('Usuário logado acessou /aladireita\n')
        get(child(ref(db), `users/${user[req.sessionID].uid}/esquema`)).then((snapshot) => {
            var esquema = snapshot.val()
            get(child(ref(db), `lista/geral`)).then((snapshot) => {
                var lista = snapshot.val()
                var itens = Object.keys(lista)
                for (var i in itens) {
                    for (var j in Object.keys(esquema)) {
                        if (lista[itens[i]]) {
                            if (String(lista[itens[i]].username) == String(esquema[Object.keys(esquema)[j]].username)) {
                                delete lista[itens[i]]
                            }
                        }
                    }
                }
                res.render('lista', { lista: lista, 'pos': 'aladireita' })
            })
        })
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

router.get('/pivo', async (req, res) => {
    if (user[req.sessionID]) {
        console.log('Usuário logado acessou /pivo\n')
        get(child(ref(db), `users/${user[req.sessionID].uid}/esquema`)).then((snapshot) => {
            var esquema = snapshot.val()
            get(child(ref(db), `lista/geral`)).then((snapshot) => {
                var lista = snapshot.val()
                var itens = Object.keys(lista)
                for (var i in itens) {
                    for (var j in Object.keys(esquema)) {
                        if (lista[itens[i]]) {
                            if (String(lista[itens[i]].username) == String(esquema[Object.keys(esquema)[j]].username)) {
                                delete lista[itens[i]]
                            }
                        }
                    }
                }
                res.render('lista', { lista: lista, 'pos': 'pivo' })
            })
        })
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

router.get('/fixo', async (req, res) => {
    if (user[req.sessionID]) {
        console.log('Usuário logado acessou /fixo\n')
        get(child(ref(db), `users/${user[req.sessionID].uid}/esquema`)).then((snapshot) => {
            var esquema = snapshot.val()
            get(child(ref(db), `lista/geral`)).then((snapshot) => {
                var lista = snapshot.val()
                var itens = Object.keys(lista)
                for (var i in itens) {
                    for (var j in Object.keys(esquema)) {
                        if (lista[itens[i]]) {
                            if (String(lista[itens[i]].username) == String(esquema[Object.keys(esquema)[j]].username)) {
                                delete lista[itens[i]]
                            }
                        }
                    }
                }
                res.render('lista', { lista: lista, 'pos': 'fixo' })
            })
        })
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

router.post('/escalar/:pos', async (req, res) => {
    if (mercadoAberto != false) {
        if (user[req.sessionID]) {
            console.log('Usuário logado acessou /escalar\n')
            var pos = req.params.pos
            update(ref(db, `users/${user[req.sessionID].uid}/esquema/${pos}`), req.body).then(() => {
                res.redirect('/')
            }).catch((error) => {
                req.flash('error', 'Ocorreu um erro desconhecido, contate o suporte')
                res.redirect('/')
            })
        } else {
            console.log('Usuário não logado foi redirecionado para /login\n')
            res.redirect('/login')
        }
    } else {
        console.log('Mercado fechado\n')
        req.flash('error', 'O mercado já fechou! Abre o olho e acompanha os horários pra saber quando vai poder mexer na tua escalação de novo!')
        res.redirect('/')
    }
})

router.get('/limparescalacao', async (req, res) => {
    if (mercadoAberto != false) {
        if (user[req.sessionID]) {
            console.log('Usuário logado acessou /limparescalacao\n')
            set(ref(db, `users/${user[req.sessionID].uid}/esquema`), {}).then(() => {
                res.redirect('/')
            }).catch((error) => {
                req.flash('error', 'Ocorreu um erro desconhecido, contate o suporte')
                res.redirect('/')
            })
        } else {
            console.log('Usuário não logado foi redirecionado para /login\n')
            res.redirect('/login')
        }
    } else {
        console.log('Mercado fechado\n')
        req.flash('error', 'O mercado já fechou! Abre o olho e acompanha os horários pra saber quando vai poder mexer na tua escalação de novo!')
        res.redirect('/')
    }
})

router.post('/fecharmercado', async (req, res) => {
    console.log('Alguém alterou o mercado\n')
    if (req.body.senha == 'Gesf2120' && req.body.user == 'zap') {
        get(child(ref(db), `mercadoAberto`)).then((snapshot) => {
            console.log(snapshot.val())
            mercadoAberto = snapshot.val()
            res.send(`variável alterada para ${mercadoAberto}`)
        })
    }
})

router.post('/horamercado', async (req, res) => {
    console.log('Alguém alterou o horário do mercado\n')
    if (req.body.senha == 'Gesf2120' && req.body.user == 'zap') {
        get(child(ref(db), `horaMercado`)).then((snapshot) => {
            horaMercado = snapshot.val()
            res.send(`variável alterada para ${horaMercado}`)
        })
    }
})

router.post('/pontuacao', async (req, res) => {
    if (user[req.sessionID]) {
        console.log('Usuário logado acessou /pontuacao (post)\n')
        var pontuacao = req.body.pontuacao
        var senha = req.body.password
        var jogador = req.body.jogador
        var acao = req.body.acao
        var olheiro = req.body.user
        var pos = req.body.posicao

        if (pos == 'Goleiro') {
            pos = 'goleiros'
        } else {
            pos = 'geral'
        }

        if (senha == 'Gesf2120') {
            get(child(ref(db), `lista/${pos}/${jogador}/pontos`)).then((snapshot) => {

                if (snapshot.exists()) {
                    var pontuacaoAtual = snapshot.val()
                } else {
                    var pontuacaoAtual = 0
                }

                set(ref(db, `lista/${pos}/${jogador}/pontos`), String(parseInt(pontuacaoAtual) + parseInt(pontuacao))).then(() => {
                    console.log(`Somados ${pontuacao} pontos ao jogador ${jogador} pelo olheiro ${olheiro} pela ação ${acao}\n`)
                    set(ref(db, `registro/${pos}/${jogador}/${Date.now()}`), { 'acao': acao, 'olheiro': olheiro, 'pontuacao': pontuacao }).then(() => {
                        req.flash('error', 'Pontuação adicionada com sucesso!')
                        res.redirect('/pontuacao')
                    }).catch((error) => {
                        req.flash('error', 'Ocorreu um erro desconhecido: ' + error)
                        res.redirect('/pontuacao')
                    })
                }).catch((error) => {
                    req.flash('error', 'Ocorreu um erro desconhecido: ' + error)
                    res.redirect('/pontuacao')
                })
            }).catch((error) => {
                req.flash('error', 'Ocorreu um erro desconhecido: ' + error)
                res.redirect('/pontuacao')
            })
        } else {
            req.flash('error', 'Senha incorreta!')
            res.redirect('/pontuacao')
        }
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

router.get('/pontuacao', async (req, res) => {
    if (user[req.sessionID]) {
        console.log('Usuário logado acessou /pontuacao\n')
        res.render('pontuacao')
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

router.post('/authorize', async (req, res) => {
    if (req.body.password == 'Gesf2120') {
        console.log('Usuário logado acessou /authorize\n')
        get(child(ref(db), `lista/provisorios/${req.body.matricula}`)).then((snapshot) => {
            if (snapshot.exists()) {
                var jogador = snapshot.val()
                set(ref(db, `lista/${jogador.posicao}/${req.body.matricula}`), jogador).then(() => {
                    set(ref(db, `lista/provisorios/${req.body.matricula}`), null).then(() => {
                        res.send('Autorizado')
                    }).catch((error) => {
                        res.send('Ocorreu um erro desconhecido: ' + error)
                    })
                }).catch((error) => {
                    res.send('Ocorreu um erro desconhecido: ' + error)
                })
            } else {
                res.send('Jogador não encontrado')
            }
        }).catch((error) => {
            res.send('Ocorreu um erro desconhecido: ' + error)
        })
    } else {
        console.log('Usuário não logado tentou acessar /authorize\n')
        res.send('Não autorizado')
    }
})


router.post('/atualizar', async (req, res) => {
    if (req.body.password == 'Gesf2120') {
        console.log('Usuário logado acessou /contarpontos\n')
        get(child(ref(db), `lista`)).then((snapshot) => {
            var lista = snapshot.val()
            get(child(ref(db), `users`)).then((snapshot) => {
                var users = snapshot.val()
                for (const user in users) {

                    var pontos = parseInt(users[user].pontos)
                    var escalacao = users[user].esquema

                    if (lista.geral[escalacao.fixo.username]) {
                        pontos += parseInt(lista.geral[escalacao.fixo.username].pontos)
                    }
                    if (lista.geral[escalacao.alaesquerda.username]) {
                        pontos += parseInt(lista.geral[escalacao.alaesquerda.username].pontos)
                    }
                    if (lista.geral[escalacao.aladireita.username]) {
                        pontos += parseInt(lista.geral[escalacao.aladireita.username].pontos)
                    }
                    if (lista.geral[escalacao.pivo.username]) {
                        pontos += parseInt(lista.geral[escalacao.pivo.username].pontos)
                    }
                    if (lista.goleiros[escalacao.goleiro.username]) {
                        pontos += parseInt(lista.goleiros[escalacao.goleiro.username].pontos)
                    }
                    //pontos = parseInt(lista.geral[escalacao.aladireita.username].pontos + parseInt(lista.geral[escalacao.alaesquerda.username].pontos) + parseInt(lista.goleiros[escalacao.goleiro.username].pontos) + parseInt(lista.geral[escalacao.fixo.username].pontos) + parseInt(lista.geral[escalacao.pivo.username].pontos))
                    console.log(pontos)
                    set(ref(db, `users/${user}/pontos`), pontos).then(() => {
                        console.log(`Pontos de ${user} atualizados para ${pontos}\n`)
                    })
                }
            })
        })
    }
})

router.post('/pontuar', async (req, res) => {
    if (req.body.password == 'Gesf2120') {
        get(child(ref(db), `lista`)).then((snapshot) => {
            var lista = snapshot.val()
            get(child(ref(db), `users`)).then((snapshot) => {
                var users = snapshot.val()
                for (const user in users) {
                    var escalacao = users[user].esquema
                    var pontuacaoAtual = parseInt(users[user].pontos)
                    var pontuacaoEscalacao = 0
                    var pontuacaoNova = 0
                    if (escalacao.fixo) {
                        pontuacaoEscalacao += parseInt(escalacao.fixo.pontos)
                    }
                    if (escalacao.alaesquerda) {
                        pontuacaoEscalacao += parseInt(escalacao.alaesquerda.pontos)
                    }
                    if (escalacao.aladireita) {
                        pontuacaoEscalacao += parseInt(escalacao.aladireita.pontos)
                    }
                    if (escalacao.pivo) {
                        pontuacaoEscalacao += parseInt(escalacao.pivo.pontos)
                    }
                    if (escalacao.goleiro) {
                        pontuacaoEscalacao += parseInt(escalacao.goleiro.pontos)
                    }

                    if (lista.geral[escalacao.fixo.username]) {
                        pontuacaoNova += parseInt(lista.geral[escalacao.fixo.username].pontos)
                    }
                    if (lista.geral[escalacao.alaesquerda.username]) {
                        pontuacaoNova += parseInt(lista.geral[escalacao.alaesquerda.username].pontos)
                    }
                    if (lista.geral[escalacao.aladireita.username]) {
                        pontuacaoNova += parseInt(lista.geral[escalacao.aladireita.username].pontos)
                    }
                    if (lista.geral[escalacao.pivo.username]) {
                        pontuacaoNova += parseInt(lista.geral[escalacao.pivo.username].pontos)
                    }
                    if (lista.goleiros[escalacao.goleiro.username]) {
                        pontuacaoNova += parseInt(lista.goleiros[escalacao.goleiro.username].pontos)
                    }

                    pontuacaoAtual = pontuacaoNova - pontuacaoEscalacao

                    set(ref(db, `users/${user}/pontos`), pontuacaoAtual).then(() => {
                        console.log(`Pontos de ${user} atualizados para ${pontuacaoAtual}\n`)
                    })
                }
            })
        })
    }
})


export default router