<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase/config'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  error.value = null

  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    console.log('Logged in:', userCredential.user)
    router.push('/home')
  } catch (err) {
    console.error('Login error:', err)
    switch (err.code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        error.value = 'This email is not registered or incorrect password.'
        break
      case 'auth/wrong-password':
        error.value = 'Incorrect password. Please try again'
        break
      case 'auth/invalid-email':
        error.value = 'Invalid email address.'
        break
      case 'auth/too-many-requests':
        error.value = 'Too many failed attempts. Please try again later.'
        break
      default:
        error.value = 'Login failed. Please check your credentials'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">Welcome Back</h1>
      <p class="subtitle">Please sign in to your account</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-alert">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="name@company.com" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              aria-label="Toggle password visibility"
            >
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                ></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Sign In' }}
        </button>
      </form>

      <p class="footer-text">
        Don't have an account?
        <router-link to="/sinup">Signup</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', sans-serif;
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error-alert {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: left;
  border: 1px solid #ffcdd2;
}

.form-group {
  text-align: left;
}

label {
  display: block;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.password-input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

input:focus {
  outline: none;
  border-color: #764ba2;
  box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
  background: white;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #764ba2;
}

.submit-btn {
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  margin-top: 1rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(118, 75, 162, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.footer-text {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.footer-text a {
  color: #764ba2;
  text-decoration: none;
  font-weight: 600;
}

.footer-text a:hover {
  text-decoration: underline;
}
</style>
