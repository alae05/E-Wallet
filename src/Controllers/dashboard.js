import {getbeneficiaries ,finduserbyaccount,findbeneficiarieByid} from "../Model/database.js";
const user = JSON.parse(sessionStorage.getItem("currentUser"));
// DOM elements

const greetingName = document.getElementById("greetingName");
const currentDate = document.getElementById("currentDate");
const solde = document.getElementById("availableBalance");
const incomeElement = document.getElementById("monthlyIncome");
const expensesElement = document.getElementById("monthlyExpenses");
const activecards = document.getElementById("activeCards");
const transactionsList = document.getElementById("recentTransactionsList");
//transfer
const transferBtn = document.getElementById("quickTransfer");
const transferSection = document.getElementById("transferPopup");
const closeTransferBtn = document.getElementById("closeTransferBtn");
const cancelTransferBtn = document.getElementById("cancelTransferBtn");
const beneficiarySelect = document.getElementById("beneficiary");
const sourceCard = document.getElementById("sourceCard");
const submitTransferBtn=document.getElementById("submitTransferBtn");
//recharge
const rechargeBtn = document.getElementById("quickTopup");
const rechargeSection = document.getElementById("rechargePopup");
const closeRechargeBtn = document.getElementById("closeRechargeBtn");
const cancelRechargeBtn = document.getElementById("cancelRechargeBtn");
const submitRechargeBtn = document.getElementById("submitRechargeBtn");
const sourceCard2 = document.getElementById("sourceCard2");

// Guard
if (!user) {
  alert("User not authenticated");
  window.location.href = "/index.html";
}

// Events
  transferBtn.addEventListener("click", handleTransfersection);
  closeTransferBtn.addEventListener("click", closeTransfer);
  cancelTransferBtn.addEventListener("click", closeTransfer);
  submitTransferBtn.addEventListener("click",handleTransfer);

  rechargeBtn.addEventListener("click", handleRechargesection);
  closeRechargeBtn.addEventListener("click", closeRecharge);
  cancelRechargeBtn.addEventListener("click", closeRecharge);
  submitRechargeBtn.addEventListener("click", handleRecharge);

// Retrieve dashboard data
const getDashboardData = () => {
  const monthlyIncome = user.wallet.transactions
    .filter(t => t.type === "credit")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter(t => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  return {
    userName: user.name,
    currentDate: new Date().toLocaleDateString("fr-FR"),
    availableBalance: `${user.wallet.balance} ${user.wallet.currency}`,
    activeCards: user.wallet.cards.length,
    monthlyIncome: `${monthlyIncome} MAD`,
    monthlyExpenses: `${monthlyExpenses} MAD`,
  };
};

function renderDashboard(){
const dashboardData = getDashboardData();
if (dashboardData) {
  greetingName.textContent = dashboardData.userName;
  currentDate.textContent = dashboardData.currentDate;
  solde.textContent = dashboardData.availableBalance;
  incomeElement.textContent = dashboardData.monthlyIncome;
  expensesElement.textContent = dashboardData.monthlyExpenses;
  activecards.textContent = dashboardData.activeCards;
}

  transactionsList.innerHTML = "";

  const transactions = user.wallet.transactions || [];

  transactions.forEach(transaction => {
    // Determine the color safely
    let statusColor = "red"; // Default to red
    let statusText = transaction.statue || "Unknown"; // Fallback if statue is missing

    if (statusText.toLowerCase() === "success") {
      statusColor = "green";
    }

    const transactionItem = document.createElement("div");
    transactionItem.className = "transaction-item";
    transactionItem.innerHTML = `
      <div>${transaction.date || "No Date"}</div>
      <div>${transaction.amount || 0} MAD</div>
      <div>${transaction.type || "N/A"}</div>
      <div style="color: ${statusColor}; font-weight: bold;">${statusText}</div>
    `;
    transactionsList.appendChild(transactionItem);
  });

}
renderDashboard();

// Transfer popup
function closeTransfer() {
  transferSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}

function closeRecharge() {
  rechargeSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}

function handleTransfersection() {
  transferSection.classList.add("active");
  document.body.classList.add("popup-open");
}

function handleRechargesection() {
  rechargeSection.classList.add("active");
  document.body.classList.add("popup-open");
}

// Beneficiaries
const beneficiaries = getbeneficiaries(user.id);

function renderBeneficiaries() {
  beneficiaries.forEach((beneficiary) => {
    const option = document.createElement("option");
    option.value = beneficiary.id;
    option.textContent = beneficiary.name;
    beneficiarySelect.appendChild(option);
  });
}
renderBeneficiaries();

function renderCards() {
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = card.type+"****"+card.numcards;
    sourceCard.appendChild(option);
  });
}

renderCards();

function renderCardsR() {
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = card.type+"****"+card.numcards;
    sourceCard2.appendChild(option);
  });
}

renderCardsR();

//transfer
function checkUser(numcompte) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const beneficiary = finduserbyaccount(numcompte);
      if (beneficiary) {
        resolve(beneficiary);
      } else {
        reject("Beneficiary not found");
      }
    }, 2000);
  });
}

function checkSolde(expediteur, amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (expediteur.wallet.balance >= amount) {
        resolve("Sufficient balance");
      } else {
        reject("Insufficient balance");
      }
    }, 1000);
  });
}

function updateSolde(expediteur, destinataire, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      expediteur.wallet.balance -= amount;
      destinataire.wallet.balance += amount;
      resolve("Balance update done");
    }, 200);
  });
}

function addtransactions(expediteur, destinataire, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const credit = {
        id: Date.now(),
        type: "credit",
        amount: amount,
        date: new Date().toLocaleString(),
        from: expediteur.name,
        statue: "success"
      };
      const debit = {
        id: Date.now() + 1,
        type: "debit",
        amount: amount,
        date: new Date().toLocaleString(),
        to: destinataire.name,
        statue: "success"
      };

      expediteur.wallet.transactions.push(debit);
      destinataire.wallet.transactions.push(credit);
      resolve("Transaction added successfully");
    }, 500);
  });
}

//recharge


function checkCardExist(nom){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (nom.wallet.cards.length > 0){
        resolve("Available cards");
      }else {
        reject("Error : No card found");
      }
    },500)
  });
}

function checkCardValid(nom, cardNum){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const card = nom.wallet.cards.find(c => c.numcards === String(cardNum));
      
      if (!card) {
        return reject("Unavailable card");
      }

      const today = new Date();
      const expiryDate = new Date(card.expiry);

      if (expiryDate > today) {
        resolve("Valid card");
      } else {
        reject("Erreur : Expired card");
      }
    },500)
  });
}

function checkSoldeR(nom, cardNum, amount2) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const card = nom.wallet.cards.find(c => c.numcards === String(cardNum));
      
      if (!card) {
        return reject("Error: Card not found for balance verification.");
      }

      if (card.balance >= amount2) {
        resolve("Sufficient card balance.");
      } else {
        reject("Error: Insufficient funds on this card for this recharge.");
      }
    }, 500);
  });
}

function updateSoldeR(nom, amount2){
  return new Promise((resolve) => {
    setTimeout(() => {
      nom.wallet.balance += amount2;
      resolve("Balance update done");
    }, 200);
  });
}

function addTransactionsR(nom, amount2){
  return new Promise((resolve) => {
    setTimeout(() => {
      const recharge = {
        id: Date.now() + 1,
        type: "recharge",
        amount: amount2,
        date: new Date().toLocaleString(),
        to: nom.name,
        statue: "success"
      };
      nom.wallet.transactions.push(recharge);
      resolve("Recharge added successfully");
    }, 500);
  });
}

// **************************************transfer***************************************************//

function transfer(expediteur, numcompte, amount) {
  console.log("Starting transfer...");

  checkUser(numcompte)
    .then((destinataire) => {
      console.log("Step 1: Destinataire found -", destinataire.name);
      return checkSolde(expediteur, amount).then(() => destinataire);
    })
    .then((destinataire) => {
      console.log("Step 2: Balance verified");
      return updateSolde(expediteur, destinataire, amount).then(() => destinataire);
    })
    .then((destinataire) => {
      console.log("Step 3: Balances updated");
      return addtransactions(expediteur, destinataire, amount);
    })
    .then((message) => {
      console.log("Step 4:", message);
      renderDashboard(); 
      closeTransfer();    
    })
    .catch((error) => {
      const failedTransaction = {
        id: Date.now(),
        type: "debit",
        amount: amount,
        date: new Date().toLocaleString(),
        to: "Inconnu/Erreur",
        statue: "failed" 
      };
      expediteur.wallet.transactions.push(failedTransaction);

      console.error("Transfer Failed:", error);
      alert(error);
    });
}

function recharge(nom, cardNum, amount2){
  console.log("Starting recharge...");

  checkCardExist(nom)
    .then(() => {
      console.log("Step 1: Card found -");
      return checkCardValid(nom, cardNum).then(() => nom);
    })
    .then(() => {
      console.log("Étape 2 : Valid card -");
      // NOUVELLE ÉTAPE : Vérification du solde de la carte
      return checkSoldeR(nom, cardNum, amount2);
    })
    .then(() => {
      console.log("Step 3: Valid balance card -");
      return updateSoldeR(nom, amount2).then(() => nom);
    })
    .then(() => {
      console.log("Step 4: Sold updated -");
      return addTransactionsR(nom, amount2);
    })
    .then((message) => {
      console.log("Step 5:", message);
      renderDashboard(); 
      closeRecharge();    
    })
    .catch((error) => {
      const failedRecharge = {
        id: Date.now(),
        type: "recharge",
        amount: amount2,
        date: new Date().toLocaleString(),
        to: nom.name,
        statue: "failed"
      };
      nom.wallet.transactions.push(failedRecharge);

      // 2. SAUVEGARDER dans le sessionStorage (Crucial !)
      sessionStorage.setItem("currentUser", JSON.stringify(nom));

      // 3. METTRE À JOUR L'AFFICHAGE (C'est ce qui manquait)
      renderDashboard();

      console.error("Recharge Failed:", error);
      alert(error);
    });
}

function handleTransfer(e) {
 e.preventDefault();
  const beneficiaryId = document.getElementById("beneficiary").value;
  const beneficiaryAccount=findbeneficiarieByid(user.id,beneficiaryId).account;
  const sourceCard = document.getElementById("sourceCard").value;

  const amount = Number(document.getElementById("amount").value);

transfer(user, beneficiaryAccount, amount);

} 

function handleRecharge(e) {
 e.preventDefault();
  const sourceCard2 = document.getElementById("sourceCard2").value;
  const amount2 = Number(document.getElementById("amount2").value);
  if (amount2 >= 10 && amount2 <= 5000){
    recharge(user, sourceCard2, amount2);
  }else {
    alert("Amount must be between 10 - 5000");
  }
} 
