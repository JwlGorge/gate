from locust import HttpUser, task, between
import random
import string

class GateUser(HttpUser):
    # Simulate human think time between actions (1-5 seconds)
    wait_time = between(1, 5)
    
    def on_start(self):
        """
        Called when a virtual user starts. 
        We generate a unique email format as required: tveYYdeptRRR@cet.ac.in
        """
        year = "22"
        dept = random.choice(["cs", "ec", "me", "ee", "ce"])
        roll = f"{random.randint(0, 999):03d}"
        self.email = f"tve{year}{dept}{roll}@cet.ac.in"
        self.name = "".join(random.choices(string.ascii_letters, k=8))
        
        # Perform initial login
        self.login()

    def login(self):
        with self.client.post(
            "/login", 
            json={"name": self.name, "email": self.email},
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Login failed with status {response.status_code}")

    @task(3)
    def view_questions(self):
        self.client.get("/questions/gate1")

    @task(1)
    def check_rankings(self):
        self.client.get("/rankings", params={"email": self.email})

    @task(2)
    def submit_mock_result(self):
        score = round(random.uniform(0, 100), 2)
        payload = {
            "user_email": self.email,
            "qp_name": "gate1",
            "score": score,
            "total_questions": 65,
            "correct_answers": random.randint(0, 40),
            "wrong_answers": random.randint(0, 20),
            "skipped_questions": random.randint(0, 5)
        }
        self.client.post("/submit", json=payload)

    @task(5)
    def health_check(self):
        self.client.get("/health")
