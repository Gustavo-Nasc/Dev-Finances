const Modal = {
    open() {
        //Abrir Modal
        //Adicionar a class active ao modal
        document.querySelector('.modal-overlay')
            .classList.toggle('active')
    },
    close() {
        //Fechar Modal
        //Remover a class active ao modal
        document.querySelector('.modal-overlay')
            .classList.toggle('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transaction")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transactions))
    }
}

//Esse é uma Array, uma Matriz de valores, esses valores são inseridos pelo Usuário no Formulário da Modal
const calcTransaction = {
    //Aqui é uma Refatoração, mexendo na estrutura para que possamos expandir a aplicação de alguma forma
    all: Storage.get(),

    add(transaction) {
        calcTransaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        //Método que é aplicado a Array's, ele espera o número do index (ou seja, a ´posição, que inicia no 0)
        calcTransaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        //Criar uma variável referente às transações de entrada
        let income = 0

        //Pegar todas as transações, e para cada transação
        calcTransaction.all.forEach(transaction => {
            //Se for maior que zero, somar a uma variável e retornar a variável
            if (transaction.amount > 0) {
                income += transaction.amount;
            }

        })

        return income;
    },

    expenses() {
        //Criar uma variável referente às transações de saída
        let expense = 0

        //Pegar todas as transações, e para cada transação
        calcTransaction.all.forEach(transaction => {
            //Se for maior que zero, somar a uma variável e retornar a variável
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }

        })

        return expense;
    },

    total() {
        //O total é refente às Entradas + Saidas
        return calcTransaction.incomes() + calcTransaction.expenses();
    }
}

//Variável reponsável por apresentar as transações no HTML
const DOM = {
    //Aqui nós pegamos a Table criada no HTML para a apresentação das informações
    transactionsContainer: document.querySelector('#data-table'),

    //Função cria uma nova linha na Table do HTML (tr), adicionando uma Transação
    addTransaction(calcTransaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(calcTransaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    //Função responsável pela criação de Colunas nas Linhas da Table (td), pega a funçaõ que adiciona "tr's" a Table e adiciona as informações de entrada do usuário
    innerHTMLTransaction(calcTransaction, index) {
        const CSSclass = calcTransaction.amount > 0 ? "income" :
            "expense"

        const amount = Utils.formatCurrency(calcTransaction.amount)

        const html = `
        <td class="description">${calcTransaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${calcTransaction.date}</td>
        <td>
            <img onClick="calcTransaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },
    //Função responsável por atualizar a formatação dos valores (id) para Moeda (BRL - R$)
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(calcTransaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(calcTransaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(calcTransaction.total())
    },
    //Função que limpa as transações
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

//Variável responsável por formatar os valores para Moeda (BRL - R$)
const Utils = {
    formatAmount(value) {
        value = Number(value) * 100

        return value
    },

    formateDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    //Funcionalidade de Verificar campos (Se algum deles está vazio)
    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    //Funcionalidade para Formatar os valores dos campos
    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formateDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            //Verificar se todas as informações foram preenchidas
            Form.validateFields()
            //Formatação dos Dados para salvar
            const transaction = Form.formatValues()
            //Salvar, adicionando a nova transação
            calcTransaction.add(transaction)
            //Apagar os Dados do Formulário
            Form.clearFields()
            //Modal feche
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        //Função responsável por apresentar no HTML as transações
        calcTransaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(calcTransaction.all)
    },
    //Funcionalidade que fará a releitura das infomações
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()