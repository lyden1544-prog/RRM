<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <h1>MockConnect</h1>
        <p class="subtitle">Admin Dashboard</p>

        <!-- Tabs -->
        <div class="tabs">
          <button 
            :class="['tab', { active: isLogin }]"
            @click="isLogin = true"
          >
            Login
          </button>
          <button 
            :class="['tab', { active: !isLogin }]"
            @click="isLogin = false"
          >
            Register
          </button>
        </div>

        <!-- Login Form -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="form">
          <div class="form-group">
            <label>Email</label>
            <input 
              v-model="loginForm.email" 
              type="email" 
              placeholder="your@email.com"
              required
            />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">{{ success }}</p>
        </form>

        <!-- Register Form -->
        <form v-else @submit.prevent="handleRegister" class="form">
          <div class="form-group">
            <label>Full Name</label>
            <input 
              v-model="registerForm.full_name" 
              type="text" 
              placeholder="John Doe"
              required
            />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input 
              v-model="registerForm.email" 
              type="email" 
              placeholder="your@email.com"
              required
            />
          </div>
          <div class="form-group">
            <label>Company</label>
            <input 
              v-model="registerForm.company_name" 
              type="text" 
              placeholder="Your Company"
            />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Creating account...' : 'Register' }}
          </button>
          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">{{ success }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const isLogin = ref(true);
    const loading = ref(false);
    const error = ref('');
    const success = ref('');

    const loginForm = ref({
      email: '',
      password: '',
    });

    const registerForm = ref({
      full_name: '',
      email: '',
      company_name: '',
      password: '',
    });

    const handleLogin = async () => {
      error.value = '';
      success.value = '';
      loading.value = true;

      try {
        await authStore.login(loginForm.value);
        success.value = 'Login successful! Redirecting...';
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err) {
        error.value = err.response?.data?.message || 'Login failed. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const handleRegister = async () => {
      error.value = '';
      success.value = '';
      loading.value = true;

      try {
        await authStore.register(registerForm.value);
        success.value = 'Registration successful! Redirecting to dashboard...';
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err) {
        error.value = err.response?.data?.message || 'Registration failed. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    return {
      isLogin,
      loading,
      error,
      success,
      loginForm,
      registerForm,
      handleLogin,
      handleRegister,
    };
  },
};
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 1rem;
}

.login-box {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

h1 {
  text-align: center;
  margin: 0 0 0.5rem;
  color: #2c3e50;
  font-size: 2rem;
}

.subtitle {
  text-align: center;
  color: #7f8c8d;
  margin: 0 0 2rem;
  font-size: 0.9rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ecf0f1;
}

.tab {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  color: #7f8c8d;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab:hover {
  color: #667eea;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 1rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
  padding: 0.5rem;
  background: #fee;
  border-radius: 4px;
}

.success {
  color: #27ae60;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
  padding: 0.5rem;
  background: #d5f4e6;
  border-radius: 4px;
}

@media (max-width: 600px) {
  .login-box {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>