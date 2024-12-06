import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  Proposals, 
  Proposals__factory, 
  Proposition__factory 
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractTransactionResponse } from "ethers";

describe("Proposals Contract", function () {
  let proposalsContract: Proposals;
  let owner: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;

  beforeEach(async function () {
    // Récupération des signers
    [owner, voter1, voter2] = await ethers.getSigners();

    // Déploiement du contrat Proposals
    const ProposalsFactory: Proposals__factory = await ethers.getContractFactory("Proposals");
    proposalsContract = await ProposalsFactory.deploy();
    await proposalsContract.waitForDeployment();
  });

  describe("Création de Propositions", function () {
    it("Devrait créer une nouvelle proposition", async function () {
      // Créer une proposition
      const tx: ContractTransactionResponse = await proposalsContract
        .connect(owner)
        .createProposition("Proposition de Test", "Description de test");
      
      const receipt = await tx.wait();
      
      // Vérification de l'événement
      if (!receipt) throw new Error("Transaction receipt is null");
      const event = receipt.logs[0];
      
      expect(event.fragment.name).to.equal("PropositionCreated");

      // Récupérer toutes les propositions
      const proposals: string[] = await proposalsContract.getAllPropositions();
      expect(proposals.length).to.equal(1);
    });

    it("Devrait permettre à différents utilisateurs de créer des propositions", async function () {
      // Créer des propositions par différents utilisateurs
      await proposalsContract.connect(owner).createProposition("Prop 1", "Desc 1");
      await proposalsContract.connect(voter1).createProposition("Prop 2", "Desc 2");
      await proposalsContract.connect(voter2).createProposition("Prop 3", "Desc 3");

      const proposals: string[] = await proposalsContract.getAllPropositions();
      expect(proposals.length).to.equal(3);
    });
  });

  describe("Gestion des Propositions par Utilisateur", function () {
    it("Devrait suivre les propositions de chaque utilisateur", async function () {
      // Créer des propositions par différents utilisateurs
      await proposalsContract.connect(owner).createProposition("Prop 1", "Desc 1");
      await proposalsContract.connect(owner).createProposition("Prop 2", "Desc 2");
      await proposalsContract.connect(voter1).createProposition("Prop 3", "Desc 3");

      // Vérifier les propositions de l'owner
      const ownerProposals: string[] = await proposalsContract.getUserPropositions(owner.address);
      expect(ownerProposals.length).to.equal(2);

      // Vérifier les propositions de voter1
      const voter1Proposals: string[] = await proposalsContract.getUserPropositions(voter1.address);
      expect(voter1Proposals.length).to.equal(1);
    });

    it("Devrait récupérer les adresses des propositions correctement", async function () {
      // Créer une proposition
      const tx: ContractTransactionResponse = await proposalsContract
        .connect(owner)
        .createProposition("Proposition Test", "Description test");
      
      const receipt = await tx.wait();
      
      // Vérifier que le receipt n'est pas null
      if (!receipt) throw new Error("Transaction receipt is null");

      // Récupérer l'adresse de la proposition
      const proposalAddress: string = receipt.logs[0].args[0];

      // Vérifier que l'adresse est bien dans la liste des propositions
      const proposals: string[] = await proposalsContract.getAllPropositions();
      expect(proposals).to.include(proposalAddress);
    });
  });
});