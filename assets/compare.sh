#!/bin/bash

echo Running all TestCases...
cd $1
mainoutfiles=(`ls ./output/out*.txt`)

yourfiles=(`ls  myoutput/myout*.txt `)

zero=0;
failed=0;

len=${#mainoutfiles[@]}


for((i=0; i<$len; i++)) do
  if cmp -s "${mainoutfiles[i]}" "${yourfiles[i]}"; then
      printf ' TestCases %s  \e[1;32m ✔ \e[0m\n' "${i}" 
  else
      printf ' TestCases %s  \e[1;31m ✘ \e[0m \n' "${i}" 
      failed=$((failed+1))
  fi
  #  echo TestCase $i...
  # echo ===================
  # echo Expected Output
  # cat ${mainoutfiles[i]} && echo
  # echo Your Output
  # cat ${yourfiles[i]} && echo
  # echo ===================
  # echo
done

if [ "$failed" -ne 0 ]; then
  if [ "$failed" -eq 1 ]; then
    printf '\e[1;31m%s TestCase Failed \e[0m \n' "${failed}" 
  else
    printf '\e[1;31m%s TestCases Failed \e[0m \n' "${failed}" 
  fi
else
  printf '\e[1;32m All TestCases passed \e[0m\n'
fi


cd ..