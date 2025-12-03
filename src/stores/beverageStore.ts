import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import bases from "../data/bases.json";
import syrups from "../data/syrups.json";
import creamers from "../data/creamers.json";
import db from "../firebase.ts";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  QuerySnapshot,
  QueryDocumentSnapshot,
  onSnapshot,
  query,
  where,
  Unsubscribe,
  DocumentSnapshot,
} from "firebase/firestore";
import type { User } from "firebase/auth";

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,
    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,
    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",
    user: null as User | null,
    snapshotUnsubscribe: null as Unsubscribe | null,
  }),

  actions: {
    init() {
      const baseCollection = collection(db, "bases");
      getDocs(baseCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            bases.forEach((b) => {
              const base = doc(db, `bases/${b.id}`);
              setDoc(base, { name: b.name, color: b.color })
                .then(() => {
                  console.log(`New base with ID ${b.id} inserted`);
                })
                .catch((error: any) => {
                  console.error("Error adding document: ", error);
                });
            });
            this.bases = bases;
          } else {
            this.bases = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as BaseBeverageType[];
          }
          this.currentBase = this.bases[0];
          console.log("getting bases: ", this.bases);
        })
        .catch((error: any) => {
          console.error("Error getting documents:", error);
        });
      const syrupCollection = collection(db, "syrups");
      getDocs(syrupCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            syrups.forEach((b) => {
              const syrup = doc(db, `syrups/${b.id}`);
              setDoc(syrup, { name: b.name, color: b.color })
                .then(() => {
                  console.log(`New syrup with ID ${b.id} inserted`);
                })
                .catch((error: any) => {
                  console.error("Error adding document: ", error);
                });
            });
            this.syrups = syrups;
          } else {
            this.syrups = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as SyrupType[];
            console.log("getting syrups: ", this.syrups);
          }
          this.currentSyrup = this.syrups[0];
        })
        .catch((error: any) => {
          console.error("Error getting syrups:", error);
        });

      const creamerCollection = collection(db, "creamers");
      getDocs(creamerCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            creamers.forEach((b) => {
              const creamer = doc(db, `creamers/${b.id}`);
              setDoc(creamer, { name: b.name, color: b.color })
                .then(() => {
                  console.log(`New creamer with ID ${b.id} inserted`);
                })
                .catch((error: any) => {
                  console.error("Error adding document: ", error);
                });
            });
            this.creamers = creamers;
          } else {
            this.creamers = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as CreamerType[];

            console.log("getting creamers: ", this.creamers);
          }
          this.currentCreamer = this.creamers[0];
        })
        .catch((error: any) => {
          console.error("Error getting creamers:", error);
        });
    },

    showBeverage() {
      if (!this.currentBeverage) return;
      this.currentName = this.currentBeverage.name;
      this.currentTemp = this.currentBeverage.temp;
      this.currentBase = this.currentBeverage.base;
      this.currentSyrup = this.currentBeverage.syrup;
      this.currentCreamer = this.currentBeverage.creamer;
      console.log(
        `currentBeverage changed`,
        this.currentBase,
        this.currentCreamer,
        this.currentSyrup
      );
    },
    makeBeverage() {
      if(this.user == null) {
        return "Please sign in to make a beverage.";
      } else {
        //make beverage under user
        if(this.currentName.trim() === ""){
          return "Please enter a name";
        }
        if(this.currentBase && this.currentCreamer && this.currentSyrup){
          this.currentBeverage = {
            id: (this.currentBase?.id)+(this.currentCreamer?.id)+(this.currentSyrup?.id)+this.currentName,
            uid: this.user.uid,
            name: this.currentName,
            temp: this.currentTemp,
            base: this.currentBase,
            creamer: this.currentCreamer,
            syrup: this.currentSyrup
          };

          const bev = doc(db, "Users", `${this.user?.uid}`, "beverages", `${this.currentBeverage?.id}`)
          setDoc(bev,{
            id: this.currentBeverage?.id,
            uid: this.currentBeverage?.uid,
            name: this.currentBeverage?.name,
            temp: this.currentBeverage?.temp,
            base: this.currentBeverage?.base,
            creamer: this.currentBeverage?.creamer,
            syrup: this.currentBeverage?.syrup
          });
          return `Successfully added ${this.currentBeverage?.name}`;
        }
        return "Failed to make beverage";
      }
    },
    setUser(user: User | null) {
      this.user = user;
      if(!user){ //user not signed in
        //reset bevs, currentBev, and Bev components
        this.currentBeverage = null;
        this.currentTemp = this.temps[0]
        this.currentBase = this.bases[0];
        this.currentCreamer = this.creamers[0];
        this.currentSyrup = this.syrups[0];
        this.currentName = "";
        this.beverages = [];
        //remove listener
        this.snapshotUnsubscribe!();
      } else {
        
        //add listener
        const bevs = collection(db, "Users", `${user?.uid}`, "beverages")
        this.snapshotUnsubscribe = onSnapshot(bevs,(qs: QuerySnapshot) => {
          //set beverages if beverages are not empty
          if(!qs.empty){
            this.beverages = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              base: qd.data().base,
              creamer: qd.data().creamer,
              syrup: qd.data().syrup,
              temp: qd.data().temp,
              uid: qd.data().uid
            })) as BeverageType[]
          }
        })
        //update beverages to the user's
        
      }
    },
  },
});
