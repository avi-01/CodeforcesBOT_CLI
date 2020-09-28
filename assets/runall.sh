#!/bin/bash
problem=$1
cd $problem

g++-8 --std=c++14 -o sol sol.cpp || { echo "$problem/sol.cpp failed to build. Check for errors."; exit 1; }
echo Compiled successfully...

infiles=(`ls input/input*.txt`)
# echo ${infiles[@]}
for ((i=0; i<${#infiles[@]}; i++)); do
  ./sol < input/input$i.txt > myoutput/myout$i.txt 
done

cd ..
./compare.sh $problem
cd ..