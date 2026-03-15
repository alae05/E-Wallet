let userData = JSON.parse(localStorage.getItem("currentUser"));

if (!userData) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    initTransferLogic();
});

function updateUI() {
    document.getElementById("greetingName").textContent = userData.name;
    document.getElementById("availableBalance").textContent = `${userData.wallet.balance} MAD`;
    document.getElementById("activeCards").textContent = userData.wallet.cards.length;
    
    const income = userData.wallet.transactions
        .filter(t => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0);
    const expenses = userData.wallet.transactions
        .filter(t => t.type === "debit")
        .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById("monthlyIncome").textContent = `+${income} MAD`;
    document.getElementById("monthlyExpenses").textContent = `-${expenses} MAD`;
}

function initTransferLogic() {
    const transferSection = document.getElementById("transfer-section");
    const quickTransferBtn = document.getElementById("quickTransfer");
    const closeBtn = document.getElementById("closeTransferBtn");
    const transferForm = document.getElementById("transferForm");
    const cardSelect = document.getElementById("sourceCard");
    const beneficiarySelect = document.getElementById("beneficiary");

    cardSelect.innerHTML = '<option value="" disabled selected>Sélectionner une carte</option>';
    userData.wallet.cards.forEach(card => {
        const option = document.createElement("option");
        option.value = card.numcards;
        option.textContent = `${card.type.toUpperCase()} (**** ${card.numcards.slice(-4)})`;
        cardSelect.appendChild(option);
    });

    const allUsers = [
        { name: "Ali", email: "Ali@example.com" },
        { name: "Ahmed", email: "Ahmed@example.com" }
    ];

    const listBeneficiaires = allUsers.filter(user => user.email !== userData.email);
    beneficiarySelect.innerHTML = '<option value="" disabled selected>Choisir un bénéficiaire</option>';
    listBeneficiaires.forEach(b => {
        const option = document.createElement("option");
        option.value = b.name;
        option.textContent = `${b.name} (${b.email})`;
        beneficiarySelect.appendChild(option);
    });

    quickTransferBtn.addEventListener("click", () => transferSection.classList.remove("hidden"));
    closeBtn.addEventListener("click", () => transferSection.classList.add("hidden"));

    transferForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById("amount").value);
        const beneficiaryName = beneficiarySelect.value;
        const selectedCardNum = cardSelect.value;

        if (amount > userData.wallet.balance) {
            alert("Solde insuffisant !");
            return;
        }

        userData.wallet.balance -= amount;
        userData.wallet.transactions.unshift({
            id: Date.now().toString(),
            type: "debit",
            amount: amount,
            date: new Date().toLocaleDateString('fr-FR'),
            from: selectedCardNum,
            to: beneficiaryName
        });

        localStorage.setItem("currentUser", JSON.stringify(userData));
        alert("Transfert réussi !");
        transferSection.classList.add("hidden");
        transferForm.reset();
        updateUI();
    });
}