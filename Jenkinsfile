pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'lehongphat'
        DOCKER_HUB_CREDS_ID = 'docker-hub-creds'
        IMAGE_NAME = "${DOCKER_HUB_USER}/primesound-backend"
    }

    stages {
        stage('Tải mã nguồn') {
            steps {
                checkout scm
            }
        }

        stage('Đóng gói Back-end') {
            steps {
                script {
                    // Build Image từ Dockerfile trong thư mục gốc của Repo BE
                    docker.withRegistry('', DOCKER_HUB_CREDS_ID) {
                        def beImage = docker.build("${IMAGE_NAME}:latest", ".")
                        beImage.push()
                    }
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Back-end đã được build và push thành công!'
        }
        failure {
            echo '❌ Build Back-end thất bại.'
        }
    }
}
