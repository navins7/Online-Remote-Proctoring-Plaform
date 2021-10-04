# Online-Remote-Proctoring-Plaform
-Custom real-time “Online Remote Proctoring Platform” that proctors using Computer Vision and Machine Learning Algorithms. 
-Automated customizable proctoring platform that continuously verifies the identity of online test-takers, while detecting and deterring misconduct using Artificial Intelligence.

# Online Remote Proctoring

ASEAN-INDIA Hackathon 2021

- Problem Statement : 11
- Team Number : 44 ( Winners )

## Problem Statement

In online test without proctoring, cases are often reported of impersonation and cheating. Students either ask some else to take the test on their behalf or use methods of cheating like referring to a textbook, using smartphones or other devices to search for answers online or taking help from a friend. The two major concerns of the customer are cheating and student authentication.

[Problem Statement](https://india-asean.mic.gov.in/problem-statement)

## Solution

1. Facial verification during login
2. Two set of users, student and invigilator
3. The platform can check for the following
   - Student environment validation before the test ie. microphone, audio system, webcam validation
   - Tab switch detection
   - Copy paste disable while taking the exam
   - Browser size change detection
   - Student environment brightness validation
   - Continuous face detection and head movement detection during the examination
   - Audio detection and translation
   - Facial verification to ensure the same person is taking the test throughout the duration
   - In case of network failure, the test can be resumed from where the student left
4. A Scientific calculator is embedded in the test
5. The invigilator can monitor student activities and any violation of the above points in real time
6. In case of head movement detection and face detection, the image is also saved when the violation is detected
7. The invigilator can also end the test on behalf of the student
8. The invigilator can also proctor the students via video conferencing
9. The invigilator can also decide to configure the test in such a way that violation of any test constraints or multiple violations of the same test constraints will lead to an immediate ending of the test.

## Installation

- `sh setup.sh`
- 3 folders are created
   - Online-Remote-Proctoring-AI
   - Online-Remote-Proctoring-Backend
   - Online-Remote-Proctoring-Frontend
- To install the frontend, go to https://github.com/Sid200026/Online-Remote-Proctoring-Frontend
- To install the backend, go to https://github.com/Sid200026/Online-Remote-Proctoring-Backend
- To install the ai-platform, go to https://github.com/Sid200026/Online-Remote-Proctoring-AI

## Team Members

![Team Architecture](./assets/team.jpeg)
