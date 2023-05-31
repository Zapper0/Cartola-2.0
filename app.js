import express from 'express'
const app = express()
import handlebars from 'express-handlebars'
import flash from 'connect-flash'
import session from 'express-session'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, child, get } from 'firebase/database'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, browserSessionPersistence, inMemoryPersistence, setPersistence, reauthenticateWithCredential } from 'firebase/auth'
import { getStorage, uploadBytes, getDownloadURL, ref as refStorage } from 'firebase/storage'
import bb from 'express-busboy'
import path from 'path'
import fs from 'fs'

const __dirname = path.resolve()
const uploadPath = path.join(__dirname, 'uploads')

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

const firebaseApp = initializeApp(firebaseConfig)
const db = getDatabase(firebaseApp)
const storage = getStorage(firebaseApp)

var mercadoAberto = false

var admins = ['G6Q4p9AG6SSJhc4JhhDgYmZkNYq1']

const defaultSet = {
    futsal: {
        goleiro: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        fixo: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        alaesquerda: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        aladireita: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        pivo: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
    },
    handebol: {
        goleiro: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        pivo: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        pontaesquerda: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        pontadireita: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        meiaesquerda: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        meiadireita: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        armador: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        }
    },
    basquete: {
        pivo: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        ala: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        alapivo: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        alaarmador: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
        armador: {
            equipe: null,
            foto: 'https://cdn.discordapp.com/attachments/1089033461668515850/1095162087950524637/2854274f-14d6-46a8-9bd9-382a72db6ee3.png',
            matricula: null,
            nome: null,
            numero: null,
            pontos: null
        },
    }
}

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

app.use(flash())

bb.extend(app, {
    upload: true,
    path: 'src/uploads',
    strip: (value, type) => {
        return value
    }
})



app.use(express.static('src'))

app.engine('handlebars', handlebars.engine({
    defaultLayout: false,
    helpers: {
        json: function (context) {
            return JSON.stringify(context)
        }
    }
}))
app.set('view engine', 'handlebars')

//rotas 


app.get('/', async (req, res) => {
    const auth = getAuth()
    const user = auth.currentUser
    var admin = false
    if (user) {
        admins.indexOf(user.uid) > -1 ? admin = true : admin = false

        console.log(`${admin ? `Admin ${user.uid}` : 'Usuário logado'} acessou /\n`)
        get(child(ref(db), `users/${user.uid}`)).then((snapshot) => {
            get(child(ref(db), `mercado`)).then((snapshot_) => {
                if (snapshot.exists()) {
                    res.render('main', {
                        admin: admin,
                        error: req.flash('error'),
                        success: req.flash('success'),
                        user: snapshot.val(), mercado: snapshot_.val()
                    })
                } else {
                    res.render('main', {
                        admin: admin,
                        error: req.flash('error'),
                        mercado: snapshot_.val(),
                        message: `Bem vindo(a) ao Cartola Champagnat!\n\n
                    Escale seus times e vá pontuando conforme os jogos!\n\n
                    Fique atento ao mercado, caso queira trocar algum jogador, 
                    ele precisa estar aberto.\n\nBoa sorte!`
                    })
                }
            }).catch((error) => {
                console.log('Erro ao buscar dados do mercado', error)
                req.flash('error', 'Ocorreu algum erro inesperado. Por favor tente logar novamente e, caso o erro persista, contate o suporte.')
                res.redirect('/login')
            })
        }).catch((error) => {
            console.log('Erro ao buscar dados do usuário')
            req.flash('error', 'Ocorreu algum erro inesperado. Por favor tente logar novamente e, caso o erro persista, contate o suporte.')
            res.redirect('/login')
        })
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }

})

app.get('/handebol', async (req, res) => {
    const auth = getAuth()
    var user = auth.currentUser
    if (user) {
        console.log('Usuário logado acessou /handebol\n')
        get(child(ref(db), `users/${user.uid}/escalacao/handebol`)).then((snapshot) => {
            if (snapshot.exists()) {
                res.render('handebol', { error: req.flash('error'), jogadores: snapshot.val() })
            } else {
                res.render('handebol', { error: req.flash('error'), jogadores: defaultSet })
            }
        }).catch((error) => {
            console.log('Erro ao buscar dados')
            req.flash('error', 'Ocorreu algum erro inesperado, por favor contate o suporte.')
            res.redirect('/')
        })
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

app.get('/futsal', async (req, res) => {
    const auth = getAuth()
    var user = auth.currentUser
    if (user) {
        console.log('Usuário logado acessou /futsal\n')
        get(child(ref(db), `users/${user.uid}/escalacao/futsal`)).then((snapshot) => {
            if (snapshot.exists()) {
                res.render('futsal', { error: req.flash('error'), jogadores: snapshot.val() })
            } else {
                res.render('futsal', { error: req.flash('error'), jogadores: defaultSet })
            }
        }).catch((error) => {
            console.log('Erro ao buscar dados')
            req.flash('error', 'Ocorreu algum erro inesperado, por favor contate o suporte.')
            res.redirect('/');
        });

    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

app.get('/basquete', async (req, res) => {
    const auth = getAuth()
    var user = auth.currentUser
    if (user) {
        console.log('Usuário logado acessou /basquete\n')
        get(child(ref(db), `users/${user.uid}/escalacao/basquete`)).then((snapshot) => {
            if (snapshot.exists()) {
                res.render('basquete', { error: req.flash('error'), jogadores: snapshot.val() })
            } else {
                res.render('basquete', { error: req.flash('error'), jogadores: defaultSet })
            }
        }).catch((error) => {
            console.log('Erro ao buscar dados')
            req.flash('error', 'Ocorreu algum erro inesperado, por favor contate o suporte.')
            res.redirect('/')
        })
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

app.get('/jogadores/:esporte/:posicao', async (req, res) => {
    const auth = getAuth()
    var user = auth.currentUser
    if (user) {
        console.log(`Usuário logado acessou /jogadores/${req.params.esporte}/${req.params.posicao}\n`)
        get(child(ref(db), `lista/${req.params.esporte}/${req.params.posicao}`)).then((snapshot) => {
            if (snapshot.exists()) {
                console.log('Dados encontrados')
                res.render('lista', { jogadores: snapshot.val(), esporte: req.params.esporte, posicao: req.params.posicao })
            } else {
                console.log('Dados não encontrados')
                req.flash('error', 'Ainda não há nenhum jogador registrado para esta posição.')
                res.redirect(`/${req.params.esporte}`);
            }
        }).catch((error) => {
            console.log('Erro ao buscar dados')
            req.flash('error', 'Ocorreu algum erro inesperado, por favor contate o suporte.')
            res.redirect('/');
        });
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

app.get('/capitao/:esporte', async (req, res) => {
    const auth = getAuth()
    var user = auth.currentUser
    if (user) {
        console.log(`Usuário logado acessou /capitao/${req.params.esporte} (GET)\n`)
        get(child(ref(db), `users/${user.uid}/escalacao/${req.params.esporte}`)).then((snapshot) => {
            if (snapshot.exists()) {
                var jogadores = snapshot.val()
                if (jogadores.capitao) {
                    delete jogadores.capitao
                }
                res.render('capitao', { jogadores: Object.entries(jogadores), esporte: req.params.esporte })
            } else {
                req.flash('error', 'Ainda não há nenhum capitão registrado.')
                res.redirect(`/${req.params.esporte}`);
            }
        }).catch((error) => {
            req.flash('error', 'Ocorreu algum erro inesperado, por favor contate o suporte.')
            res.redirect('/');
        });
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

app.post('/capitao', async (req, res) => {
    const auth = getAuth()
    var user = auth.currentUser
    if (user) {
        console.log(`Usuário logado acessou /capitao (POST)\n`)
        get(child(ref(db), `lista/${req.body.esporte}/${req.body.posicao}/${req.body.matricula}`)).then((snapshot) => {
            if (snapshot.exists()) {
                var capitao = snapshot.val()
                capitao.posicao = req.body.posicao
                set(ref(db, `users/${user.uid}/escalacao/${req.body.esporte}/capitao`), capitao).then(() => {
                    console.log('Capitão registrado com sucesso')
                    req.flash('error', 'Capitão registrado com sucesso')
                    res.redirect(`/${req.body.esporte}`);
                }).catch((error) => {
                    req.flash('error', 'Ocorreu algum erro inesperado, por favor contate o suporte.')
                    res.redirect(`/${req.body.esporte}`);
                });
            } else {
                req.flash('error', 'Jogador não encontrado.')
                res.redirect(`/${req.body.esporte}`);
            }
        }).catch((error) => {
            req.flash('error', 'Ocorreu algum erro inesperado, por favor contate o suporte.')
            res.redirect('/');
        });
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

app.get('/login', async (req, res) => {
    res.render('login', { error: req.flash('error') })
})

app.post('/login', async (req, res) => {
    const auth = getAuth()
    var email = req.body.username + '@maristavirtual.org.br'
    var password = req.body.password
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Logado')
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
            } else if (errorCode == 'auth/too-many-requests') {
                req.flash('error', 'Muitas tentativas de login, tente novamente mais tarde')
                res.redirect('/login')
            }
            else if (errorCode == 'auth/missing-password') {
                req.flash('error', 'Senha não informada')
                res.redirect('/login')
            }
            else {
                req.flash('error', `Erro desconhecido, contate o suporte:\n\nCódigo de erro: ${errorCode}\nMensagem: ${errorMessage}`)
                res.redirect('/login')
            }
        })
})

app.get('/signup', async (req, res) => {
    res.render('signup')
})

app.post('/signup', async (req, res) => {
    var email = req.body.username + '@maristavirtual.org.br'
    var password = req.body.password
    var confirmPassword = req.body.confirmPassword
    var remember = Boolean(req.body.remember)
    var persistence = remember ? browserSessionPersistence : inMemoryPersistence
    const auth = getAuth()
    setPersistence(auth, persistence).then(() => {
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
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

app.get('/registerplayer', async (req, res) => {
    res.render('registerplayer')
})

app.post('/registerplayer', async (req, res) => {

    var matricula = req.body.username
    var nome = req.body.nome
    var numero = req.body.numero
    var equipe = req.body.equipe
    var esporte = req.body.esporte
    var pos = req.body.posicao
    var imagem = req.files.foto

    uploadBytes(refStorage(storage, `${matricula}`), fs.readFileSync(imagem.file)).then((uploadResult) => {
        getDownloadURL(uploadResult.ref).then((url) => {
            set(ref(db, `jogadores/provisorio/${esporte}/${matricula}`), {
                nome: nome,
                numero: numero,
                equipe: equipe,
                posicao: pos,
                foto: url
            }).then(() => {
                req.flash('error', 'Jogador registrado com sucesso')
                res.redirect(`/login`);
            }).catch((error) => {
                req.flash('error', 'Ocorreu algum erro inesperado, por favor contate o suporte.')
                res.redirect(`/registerplayer`);
            })
        }).catch((error) => {
            req.flash('error', 'Ocorreu algum erro inesperado, por favor contate o suporte.')
            res.redirect(`/registerplayer`);
        })
    }).catch((error) => {
        req.flash('error', 'Ocorreu algum erro inesperado, por favor contate o suporte.')
        res.redirect(`/registerplayer`);
    })
})

app.post('/escalar', async (req, res) => {  
    get(child(ref(db), 'mercado/aberto')).then((snapshot) => {
        mercadoAberto = snapshot.val()

        if (mercadoAberto != false) {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {

                console.log('Usuário logado acessou /escalar\n')

                const matricula = req.body.matricula;
                const posicao = req.body.posicao;
                const esporte = req.body.esporte;

                get(child(ref(db), `lista/${esporte}/${posicao}/${matricula}`)).then((snapshot) => {

                    set(ref(db, `users/${user.uid}/escalacao/${esporte}/${posicao}`), snapshot.val()).then(() => {
                        res.redirect(`/${esporte}`)
                    }).catch((error) => {
                        req.flash('error', 'Ocorreu um erro desconhecido, contate o suporte')
                        res.redirect(`/${esporte}`)
                    })

                }).catch((error) => {
                    req.flash('error', 'Ocorreu um erro desconhecido, contate o suporte')
                    res.redirect(`/${esporte}`)
                })

            } else {
                console.log('Usuário não logado foi redirecionado para /login\n')
                res.redirect('/login')
            }
        } else {
            console.log('Mercado fechado\n')
            req.flash('error', 'O mercado já fechou! Abre o olho e acompanha os horários pra saber quando vai poder mexer na tua escalação de novo!')
            res.redirect(`/${req.body.esporte}`)
        }
    })
})

app.get('/limparescalacao/:esporte', async (req, res) => {
    get(child(ref(db), 'mercado/aberto')).then((snapshot) => {
        mercadoAberto = snapshot.val()
        if (mercadoAberto != false) {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                console.log(`Usuário logado acessou /limparescalacao/${req.params.esporte}\n`)
                set(ref(db, `users/${user.uid}/escalacao/${req.params.esporte}`), {}).then(() => {
                    res.json({ success: true })
                }).catch((error) => {
                    res.json({ success: false })
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
})

app.get('/pontuacao', async (req, res) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        if (admins.indexOf(user.uid) != -1) {
            console.log(`Admin ${user.uid} acessou /pontuacao (GET)\n`)
            res.render('pontuacao')
        } else {
            console.log(`Usuário ${user.uid} tentou acessar /pontuacao (GET)\n`)
            req.flash('error', 'Você não tem permissão para acessar essa página')
            res.redirect('/')
        }
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }

})

app.post('/pontuacao', async (req, res) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        if (admins.indexOf(user.uid) != -1) {
            console.log(`Admin ${user.uid} acessou /pontuacao (POST)\n`)
            get(child(ref(db), `lista/${req.body.esporte}/${req.body.posicao}/${req.body.matricula}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log('Jogador encontrado, registrando pontuação\n')
                    const jogador = snapshot.val()
                    set(ref(db, `registro/${req.body.esporte}/${req.body.posicao}/${req.body.matricula}/${Date.now()}`), {
                        nome: jogador.nome,
                        matricula: req.body.matricula,
                        acao: req.body.acao,
                        pontos: req.body.pontos,
                        admin: user.uid
                    }).then(() => {
                        console.log(`Registrados ${req.body.pontos} pontos para ${jogador.nome}, por ${req.body.acao}\n`)
                        res.json({ success: true })
                    }).catch((error) => {
                        res.json({ success: false, message: 'Ocorreu um erro desconhecido, contate o suporte' })
                        console.log(`Error: ${error.code} - ${error.message}`)
                    })
                } else {
                    console.log('Jogador não encontrado\n')
                    res.json({ success: false, message: 'Jogador não encontrado' })
                }
            }).catch((error) => {
                console.log(`Error: ${error.code} - ${error.message}`)
                res.json({ success: false, message: 'Ocorreu um erro desconhecido, contate o suporte' })
            })
        } else {
            console.log(`Usuário ${user.uid} tentou acessar /pontuacao (POST)\n`)
            req.flash('error', 'Você não tem permissão para fazer isso')
            res.redirect('/')
        }
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

app.get('/mercado', async (req, res) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        if (admins.indexOf(user.uid) != -1) {
            console.log(`Admin ${user.uid} acessou /mercado (GET)\n`)
            get(child(ref(db), 'mercado')).then((snapshot) => {
                const mercado = snapshot.val()
                res.render('mercado', { mercado: mercado })
            })
        } else {
            console.log(`Usuário ${user.uid} tentou acessar /mercado (GET)\n`)
            req.flash('error', 'Você não tem permissão para acessar essa página')
            res.redirect('/')
        }
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

app.post('/mercado', async (req, res) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        if (admins.indexOf(user.uid) != -1) {
            console.log(`Admin ${user.uid} acessou /mercado (POST)\n`)
            set(ref(db, 'mercado'), { aberto: Boolean(req.body.aberto), hora: req.body.hora }).then(() => {
                res.redirect('/')
            }).catch((error) => {
                req.flash('error', 'Ocorreu um erro desconhecido, contate o suporte')
            })
        } else {
            console.log(`Usuário ${user.uid} tentou acessar /mercado (POST)\n`)
            req.flash('error', 'Você não tem permissão para fazer isso')
            res.redirect('/')
        }
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

app.get('/pontuar', async (req, res) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        if (admins.indexOf(user.uid) != -1) {
            console.log(`Admin ${user.uid} acessou /pontuar (GET)\n`)
            res.render('pontuar')
        } else {
            console.log(`Usuário ${user.uid} tentou acessar /pontuar (GET)\n`)
            req.flash('error', 'Você não tem permissão para acessar essa página')
            res.redirect('/')
        }
    }
})

app.post('/pontuar', async (req, res) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        if (admins.indexOf(user.uid) != -1) {
            console.log(`Admin ${user.uid} acessou /pontuar (POST)\n`)
            if (req.body.acao == 'geral') {
                get(child(ref(db), `registro`)).then((snapshot) => {
                    if (snapshot.exists()) {
                        const registro = snapshot.val()
                        Object.entries(registro).forEach(esporte => {
                            Object.entries(esporte[1]).forEach(posicao => {
                                Object.entries(posicao[1]).forEach(matricula => {
                                    var pts = 0
                                    Object.values(matricula[1]).forEach(pontuacao => {
                                        pts += pontuacao.pontos
                                    })
                                    get(child(ref(db), `lista/${esporte[0]}/${posicao[0]}/${matricula[0]}/pontos`)).then((snapshot) => {
                                        set(ref(db, `lista/${esporte[0]}/${posicao[0]}/${matricula[0]}/pontos`), pts).then(() => {
                                            // set(ref(db, `registro/${esporte[0]}/${posicao[0]}/${matricula[0]}`), null)
                                            pts -= snapshot.val()
                                            get(child(ref(db), `users`)).then((snapshot_) => {
                                                Object.entries(snapshot_.val()).forEach(user => {
                                                    if (Object.values(user[1].escalacao[esporte[0]][posicao[0]]).indexOf(parseInt(matricula[0])) != -1) {

                                                        if (user[1].pontos == undefined || user[1].pontos == NaN) {
                                                            user[1].pontos = 0
                                                        }
                                                        if (user[1].escalacao[esporte[0]].capitao.matricula == matricula[0]) {
                                                            pts *= 1.5
                                                        }
                                                        user[1].pontos += pts
                                                        set(ref(db, `users/${user[0]}/pontos`), user[1].pontos).then(() => {
                                                            console.log(`${user[0]} pontuou ${pts} pontos`)
                                                        }).catch((error) => {
                                                            console.log(`Error: ${error.code} - ${error.message}`)
                                                        })

                                                    }
                                                })
                                            })
                                        }).catch((error) => {
                                            console.log(`Error: ${error.code} - ${error.message}`)
                                        })

                                    }).catch((error) => {
                                        console.log(`Error: ${error.code} - ${error.message}`)
                                    })
                                })
                            })
                        })
                    } else {
                        console.log('Não há registro de nenhuma atividade para pontuar\n')
                        req.flash('error', 'Não há registro de nenhuma atividade para pontuar')
                    }
                    res.redirect('/')
                })
            } else if (req.body.acao == 'quimica') {
                get(child(ref(db), `users`)).then((snapshot) => {
                    Object.entries(snapshot.val()).forEach(user => {
                        //contar quantos jogadores tem de cada time na escalação do usuário
                        Object.entries(user[1].escalacao).forEach(esporte => {
                            var pts = 0
                            var times = []
                            Object.values(esporte[1]).forEach(posicao => {
                                times = times.concat(posicao.equipe)
                            })
                            pts += times.filter((value, index, self) => {
                                return self.indexOf(value) === index
                            }).length
                            pts == 1 ? pts = 0 : pts *= 5
                            pts > 15 ? pts = 15 : pts = pts
                            console.log(`${user[0]} pontuou ${pts} pontos por química no ${esporte[0]}`)
                        })
                    })
                })
            }
        } else {
            console.log(`Usuário ${user.uid} tentou acessar /pontuar (POST)\n`)
            req.flash('error', 'Você não tem permissão para fazer isso')
            res.redirect('/')
        }
    } else {
        console.log('Usuário não logado foi redirecionado para /login\n')
        res.redirect('/login')
    }
})

app.post('/authorize', async (req, res) => {
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

app.post('/atualizar', async (req, res) => {
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





//configuração da porta do servidor

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})