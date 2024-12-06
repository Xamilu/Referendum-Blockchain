import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  Proposals, 
  Proposals__factory, 
  Proposition, 
  Proposition__factory 
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractTransactionResponse } from "ethers";

describe("Proposition Contract", function () {
  let proposalsContract: Proposals;
  let propositionContract: Proposition;
  let owner: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;
  let voter3: HardhatEthersSigner;

  beforeEach(async function () {
    // Récupération des signers
    [owner, voter1, voter2, voter3] = await ethers.getSigners();

    // Déployer le contrat Proposals
    const ProposalsFactory: Proposals__factory = await ethers.getContractFactory("Proposals");
    proposalsContract = await ProposalsFactory.deploy();
    await proposalsContract.waitForDeployment();

    // Créer une proposition
    const tx: ContractTransactionResponse = await proposalsContract.createProposition(
      "Test Prop", 
      "Test Description"
    );
    const receipt = await tx.wait();
    
    // Vérifier que le receipt n'est pas null
    if (!receipt) throw new Error("Transaction receipt is null");
    
    // Récupérer l'adresse de la proposition
    const propositionAddress: string = receipt.logs[0].args[0];
    propositionContract = await ethers.getContractAt("Proposition", propositionAddress);
  });

  describe("Création de Proposition", function () {
    it("Devrait initialiser correctement une proposition", async function () {
      const details = await propositionContract.getPropositionDetails();
      
      expect(details.creator).to.equal(owner.address);
      expect(details.title).to.equal("Test Prop");
      expect(details.description).to.equal("Test Description");
      expect(details.isActive).to.be.true;
    });
  });

  describe("Processus de Vote", function () {
    it("Devrait permettre de voter pour une proposition", async function () {
      // Voter pour la proposition
      await propositionContract.connect(voter1).voteFor();
      
      // Récupérer les détails de la proposition
      const details = await propositionContract.getPropositionDetails();
      
      expect(details.votesFor).to.equal(1n);
      expect(details.votesAgainst).to.equal(0n);
    });

    it("Devrait permettre de voter contre une proposition", async function () {
      // Voter contre la proposition
      await propositionContract.connect(voter1).voteAgainst();
      
      // Récupérer les détails de la proposition
      const details = await propositionContract.getPropositionDetails();
      
      expect(details.votesFor).to.equal(0n);
      expect(details.votesAgainst).to.equal(1n);
    });

    it("Devrait empêcher un utilisateur de voter deux fois", async function () {
      // Premier vote
      await propositionContract.connect(voter1).voteFor();
      
      // Tenter de voter à nouveau
      await expect(
        propositionContract.connect(voter1).voteAgainst()
      ).to.be.revertedWith("You have already voted");
    });
  });

  describe("Calcul des Votes", function () {
    it("Devrait calculer correctement les pourcentages de vote", async function () {
      // Simuler plusieurs votes
      await propositionContract.connect(voter1).voteFor();
      await propositionContract.connect(voter2).voteFor();
      await propositionContract.connect(voter3).voteAgainst();

      // Récupérer les détails
      const details = await propositionContract.getPropositionDetails();
      
      expect(details.votesFor).to.equal(2n);
      expect(details.votesAgainst).to.equal(1n);
      expect(details.percentFor).to.equal(66n);  // 2/3 * 100
      expect(details.percentAgainst).to.equal(33n);  // 1/3 * 100
    });

    it("Devrait gérer correctement les votes avec 0 total", async function () {
      // Récupérer les détails sans votes
      const details = await propositionContract.getPropositionDetails();
      
      expect(details.percentFor).to.equal(0n);
      expect(details.percentAgainst).to.equal(0n);
    });
  });

  describe("Limitation Temporelle des Votes", function () {
    it("Devrait empêcher de voter après l'expiration du temps", async function () {
      // Avancer le temps pour simuler la fin du vote
      await ethers.provider.send("evm_increaseTime", [120]); // 2 minutes
      await ethers.provider.send("evm_mine");

      // Tenter de voter
      await expect(
        propositionContract.connect(voter1).voteFor()
      ).to.be.revertedWith("Voting period has ended");
    });

    it("Devrait permettre de clôturer la proposition après expiration", async function () {
      // Avancer le temps pour simuler la fin du vote
      await ethers.provider.send("evm_increaseTime", [120]); // 2 minutes
      await ethers.provider.send("evm_mine");

      // Clôturer la proposition
      await propositionContract.closeProposition();

      // Vérifier que la proposition est inactive
      const details = await propositionContract.getPropositionDetails();
      expect(details.isActive).to.be.false;
    });
  });
});