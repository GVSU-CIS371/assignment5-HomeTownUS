<template>
  <div>
    <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />

    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input
              type="radio"
              name="temperature"
              :id="`r${temp}`"
              :value="temp"
              v-model="beverageStore.currentTemp"
            />
            {{ temp }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="b in beverageStore.bases" :key="b.id">
          <label>
            <input
              type="radio"
              name="bases"
              :id="`r${b.id}`"
              :value="b"
              v-model="beverageStore.currentBase"
            />
            {{ b.name }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="s in beverageStore.syrups" :key="s.id">
          <label>
            <input
              type="radio"
              name="syrups"
              :id="`r${s.id}`"
              :value="s"
              v-model="beverageStore.currentSyrup"
            />
            {{ s.name }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="c in beverageStore.creamers" :key="c.id">
          <label>
            <input
              type="radio"
              name="creamers"
              :id="`r${c.id}`"
              :value="c"
              v-model="beverageStore.currentCreamer"
            />
            {{ c.name }}
          </label>
        </template>
      </li>
    </ul>

    <div class="auth-row">
      <div v-if="beverageStore.user != null">
        <span>Signed in as {{beverageStore.user?.displayName}}</span>
        <button @click="signOutBTN()">Sign Out</button>
      </div>
      <button v-else @click="withGoogle">Sign in with Google</button>
    </div>
    <input
      v-model="beverageStore.currentName"
      type="text"
      placeholder="Beverage Name"
    />

    <button :disabled="beverageStore.user == null" @click="handleMakeBeverage">🍺 Make Beverage</button>

    <p v-if="message" class="status-message">
      {{ message }}
    </p>
  </div>

  <div style="margin-top: 20px">
    <template v-for="beverage in beverageStore.beverages" :key="beverage.id">
      <input
        type="radio"
        :id="beverage.id"
        :value="beverage"
        v-model="beverageStore.currentBeverage"
        @change="beverageStore.showBeverage()"
      />
      <label :for="beverage.id">{{ beverage.name }}</label>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";
import {getAuth, GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged, signOut} from "firebase/auth";

const beverageStore = useBeverageStore();
beverageStore.init();
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  beverageStore.setUser(user);
})

const signOutBTN = () => {
  signOut(auth);
}

const message = ref("");

const showMessage = (txt: string) => {
  message.value = txt;
  setTimeout(() => {
    message.value = "";
  }, 5000);
};

const withGoogle = async () => {
  
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
  .then((result) => {
    const cred = GoogleAuthProvider.credentialFromResult(result);
    console.log("Successfully signed in");
  })
  .catch((err: any) => {
    console.error("Error:", err)
  })
};

const handleMakeBeverage = () => {
  const txt = beverageStore.makeBeverage();
  showMessage(txt);
};
</script>

<style lang="scss">
body,
html {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}

ul {
  list-style: none;
}

.auth-row {
  margin-top: 10px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-label {
  color: #ffffff;
  font-size: 0.9rem;
}

.hint {
  margin-top: 4px;
  color: #ffffff;
  font-size: 0.85rem;
}

.status-message {
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
  font-size: 0.9rem;
}
</style>
