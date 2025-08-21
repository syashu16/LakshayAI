import requests
import json
import time
from datetime import datetime

class LakshyaAICoach:
    def __init__(self):
        self.ollama_url = "http://localhost:11434"
        self.model = "llama3.2:3b"
        self.user = "syashu16"
        
    def get_career_response(self, user_message: str) -> str:
        """Generate career-focused response"""
        
        print(f"🤖 Processing message: {user_message}")
        
        # Check if Ollama is running
        if not self.is_ollama_running():
            print("⚠️ Ollama not running, using fallback")
            return self.get_fallback_response(user_message)
        
        # Create career coach prompt
        system_prompt = f"""You are ARIA, an expert AI Career Coach for LakshyaAI platform. 
Current user: {self.user} (Software Developer).

EXPERTISE: Career guidance, resume optimization, job matching, skill development, interview prep, salary negotiation.

PERSONALITY: Professional, friendly, encouraging, actionable advice.

RESPONSE STYLE:
- Keep responses 2-4 sentences for chat flow
- Use 1-2 relevant emojis maximum  
- Be specific and actionable
- Reference user's tech background when relevant

Current date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC

USER MESSAGE: {user_message}

CAREER COACH RESPONSE:"""

        try:
            print(f"🔄 Calling Ollama API...")
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "max_tokens": 300,
                        "stop": ["USER:", "Human:", "You:"]
                    }
                },
                timeout=30
            )
            
            print(f"📡 Ollama response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('response', '').strip()
                cleaned_response = self.clean_response(ai_response)
                print(f"✅ AI Response generated: {cleaned_response[:100]}...")
                return cleaned_response
            else:
                print(f"❌ Ollama API error: {response.status_code}")
            
        except requests.exceptions.ConnectionError:
            print("🔌 Connection refused - Ollama not running")
        except requests.exceptions.Timeout:
            print("⏰ Request timeout")
        except Exception as e:
            print(f"💥 Unexpected error: {e}")
            
        return self.get_fallback_response(user_message)
    
    def clean_response(self, response: str) -> str:
        """Clean up AI response"""
        # Remove unwanted prefixes
        prefixes = ["CAREER COACH RESPONSE:", "ARIA:", "AI:", "Response:", "Career Coach:"]
        for prefix in prefixes:
            if response.startswith(prefix):
                response = response[len(prefix):].strip()
        
        # Ensure it ends properly
        if response and not response.endswith(('.', '!', '?')):
            response += "."
            
        return response or "I'm here to help with your career! What specific guidance do you need?"
    
    def is_ollama_running(self) -> bool:
        """Check if Ollama service is running"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=3)
            is_running = response.status_code == 200
            print(f"🔍 Ollama status check: {'✅ Running' if is_running else '❌ Not running'}")
            return is_running
        except Exception as e:
            print(f"🔍 Ollama status check failed: {e}")
            return False
    
    def get_fallback_response(self, user_message: str) -> str:
        """Smart fallback when AI is offline"""
        msg = user_message.lower()
        
        print(f"🔄 Using fallback response for: {user_message}")
        
        if any(word in msg for word in ['resume', 'cv']):
            return "I'd love to help optimize your resume! 📄 Focus on ATS-friendly formatting, quantified achievements, and relevant keywords. For detailed AI analysis, make sure Ollama is running with: ollama serve"
            
        elif any(word in msg for word in ['job', 'position', 'role']):
            return "Great question about job opportunities! 🎯 As a developer, focus on companies that value your tech stack. I'll provide personalized job matches once the AI service is running!"
            
        elif any(word in msg for word in ['salary', 'pay', 'negotiate']):
            return "Salary negotiation is crucial! 💰 Research market rates, document your impact, and practice your pitch. I'll give you specific strategies once AI is connected!"
            
        elif any(word in msg for word in ['skill', 'learn', 'develop']):
            return "Skill development is key!  For developers, focus on emerging technologies like AI/ML and cloud platforms. Let's create a personalized path when AI reconnects!"
            
        else:
            return f"Hi {self.user}! I'm your AI Career Coach, ready to help! 🚀 I can assist with resume optimization, job search, salary negotiation, and skill development. (Note: Start Ollama with 'ollama serve' for full AI responses)"
    
    def get_status(self) -> dict:
        """Get AI service status"""
        if self.is_ollama_running():
            return {
                "status": "online", 
                "model": self.model,
                "message": "AI Career Coach is ready! 🤖"
            }
        else:
            return {
                "status": "offline",
                "model": None, 
                "message": "Start Ollama with: ollama serve"
            }

# Create global instance
print("🚀 Initializing LakshyaAI Coach...")
ai_coach = LakshyaAICoach()
print("✅ AI Coach initialized!")