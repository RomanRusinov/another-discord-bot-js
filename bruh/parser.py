from io import UnsupportedOperation
from bs4 import BeautifulSoup
import requests
import os
print(os.getcwd(), os.listdir(os.getcwd()))

urlus0 = open('/app/bruh/bruh.txt', 'r').read()
print(urlus0)
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36 OPR/76.0.4017.227'}
try:
    # urlus0.read()
    page = requests.get(urlus0, headers=headers)
    soup = BeautifulSoup(page.content, 'html.parser')
    bruh = soup.find('div', {'class': 'yuRUbf'}).find('a', href=True)['href']
    print(bruh)
    urlus1 = open('/app/bruh/bruhbruh.txt', 'a')
    urlus1.write(bruh)
    open('/app/bruh/bruh.txt', 'w').close()
except UnsupportedOperation:
    print('There is no url to read')