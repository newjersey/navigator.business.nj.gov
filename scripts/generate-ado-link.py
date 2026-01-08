#!/usr/bin/env python
import os
import re
import sys

pr_title = sys.argv[1]
ado_ticket_number = re.search(r"AB#\d*", pr_title).group()

if ado_ticket_number is None:
  with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
    fh.write(f'pr_title={pr_title}')

else:
  ado_number = re.search(r"\d+", ado_ticket_number).group()
  new_link = f"<https://dev.azure.com/NJInnovation/Business%20First%20Stop/_workitems/edit/{ado_number}|{ado_ticket_number}>"
  pr_title_with_ado_link = pr_title.replace(ado_ticket_number, new_link)

  with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
    fh.write(f'pr_title={pr_title_with_ado_link}')


