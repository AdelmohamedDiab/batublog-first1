<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from '@/firebase/config'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

const router = useRouter()

// New post form state
const newPost = ref({
  title: '',
  summary: '',
  codeSnippet: '',
})

// Posts state
const posts = ref([])
const loading = ref(true)

// Real-time listener
let unsubscribe = null

onMounted(() => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      posts.value = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          // Format date or handle timestamp
          date: data.createdAt
            ? data.createdAt.toDate().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Just now',
        }
      })
      loading.value = false
    },
    (error) => {
      console.error('Error fetching posts: ', error)
      loading.value = false
    },
  )
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const handleLogout = () => {
  console.log('logout')
  router.push('/login')
}

const handleSignup = () => {
  console.log('signup')
  router.push('/sinup')
}

const publishPost = async () => {
  if (!newPost.value.title || !newPost.value.summary) return

  if (!auth.currentUser) {
    alert('You must be logged in to publish.')
    return
  }

  try {
    await addDoc(collection(db, 'posts'), {
      title: newPost.value.title,
      summary: newPost.value.summary,
      codeSnippet: newPost.value.codeSnippet,
      author: auth.currentUser.email.split('@')[0] || 'User', // Simple fallback for display name
      authorId: auth.currentUser.uid,
      authorEmail: auth.currentUser.email,
      createdAt: serverTimestamp(),
    })

    // Reset form
    newPost.value.title = ''
    newPost.value.summary = ''
    newPost.value.codeSnippet = ''
  } catch (e) {
    console.error('Error adding document: ', e)
  }
}

const deletePost = async (id) => {
  try {
    await deleteDoc(doc(db, 'posts', id))
  } catch (e) {
    console.error('Error deleting document: ', e)
  }
}
</script>

<template>
  <div class="feed-container">
    <header class="feed-header">
      <div class="header-content">
        <h1 class="logo">Batublog</h1>
        <div class="header-actions">
          <button @click="handleSignup" class="signup-btn">Signup</button>
          <button @click="handleLogout" class="logout-btn">Login</button>
        </div>
      </div>
    </header>
    

    <main class="feed-content">
      <!-- Create Post Section -->
      <section class="create-post-section">
        <div class="create-post-card">
          <h2 class="section-title">Create Post</h2>
          <div class="input-group">
            <input
              v-model="newPost.title"
              type="text"
              placeholder="Post Title"
              class="post-input"
            />
          </div>
          <div class="input-group">
            <textarea
              v-model="newPost.summary"
              placeholder="What's on your mind?"
              class="post-input post-textarea"
            ></textarea>
          </div>
          <div class="input-group">
            <textarea
              v-model="newPost.codeSnippet"
              placeholder="Code Snippets (Optional)"
              class="post-input code-input"
            ></textarea>
          </div>
          <div class="action-row">
            <button @click="publishPost" class="publish-btn">Publish</button>
          </div>
        </div>
      </section>

      <h2 class="section-title">Latest Posts</h2>

      <div v-if="loading" class="loading-state">Loading posts...</div>

      <div v-else class="posts-grid">
        <article v-for="post in posts" :key="post.id" class="post-card">
          <button
            v-if="auth.currentUser && post.authorId === auth.currentUser.uid"
            @click="deletePost(post.id)"
            class="delete-btn"
            aria-label="Delete post"
          >
            <svg
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="card-content">
            <span class="post-date">{{ post.date }}</span>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-author">By {{ post.author }}</p>
            <p class="post-summary">{{ post.summary }}</p>

            <div v-if="post.codeSnippet" class="code-block">
              <pre><code>{{ post.codeSnippet }}</code></pre>
            </div>

            <button class="read-more-btn">Read More</button>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<style scoped>
.feed-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Inter', sans-serif;
  padding-bottom: 2rem;
}

.feed-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(to right, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.signup-btn {
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.signup-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.logout-btn {
  background: linear-gradient(to right, #667eea, #764ba2);
  border: none;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(102, 126, 234, 0.3);
  opacity: 0.95;
}

.feed-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.section-title {
  color: #1a1a1a;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

/* Create Post Styles */
.create-post-section {
  margin-bottom: 3rem;
}

.create-post-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  max-width: 800px;
  margin: 0 auto;
}

.input-group {
  margin-bottom: 1rem;
}

.post-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  color: #2d3748;
  transition: all 0.2s ease;
}

.post-input:focus {
  outline: none;
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.post-textarea {
  min-height: 100px;
  resize: vertical;
}

.code-input {
  font-family: 'Fira Code', 'Roboto Mono', monospace;
  background: #1e1e1e;
  color: #d4d4d4;
  font-size: 0.9rem;
  min-height: 120px;
}

.code-input:focus {
  background: #2d2d2d;
  color: #fff;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.publish-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(118, 75, 162, 0.4);
}

/* Post Grid Styles */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.post-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.85);
}

.delete-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.post-date {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 0.5rem;
  display: block;
}

.post-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0.5rem 0;
  line-height: 1.3;
}

.post-author {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
}

.post-summary {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.code-block {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  border: 1px solid #333;
}

.code-block pre {
  margin: 0;
}

.code-block code {
  font-family: 'Fira Code', 'Consolas', monospace;
  color: #d4d4d4;
  font-size: 0.85rem;
  line-height: 1.4;
}

.read-more-btn {
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.read-more-btn:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    padding: 0 1rem;
  }
}
</style>
