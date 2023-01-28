###
 # @Author: your name
 # @Date: 2020-07-31 10:17:07
 # @LastEditTime: 2020-08-11 09:50:58
 # @LastEditors: your name
 # @Description: In User Settings Edit
 # @FilePath: \pda-admin\ci\sonar_analyze.sh
### 
#!/bin/bash

sonar-scanner \
  -Dsonar.projectKey=HRBusiness \
  -Dsonar.sources=./src \
  -Dsonar.host.url=http://36.7.147.2:9000 \
  -Dsonar.login=liangmx \
  -Dsonar.password=nana5.bao
if [ $? -eq 0 ]; then
    echo "sonarqube code-analyze over."
fi