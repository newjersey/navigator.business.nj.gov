




import os



def find_duplicate_filenames(directory):
    counter = 0
    filenames = {}
    for filename in os.listdir(directory):
        # print(filename)
        if filename.endswith('.md'):
            with open(os.path.join(directory, filename), 'r') as file:
                content = file.read()
                filename_count = content.count('filename:')
                if filename_count > 1:
                    print(filename)
                    counter += 1
                    # need to delete the first instance of filename
                    del lines[1]

                    with open(os.path.join(directory, filename), 'w') as file2:
                        file2.writelines(lines)

    return counter

if __name__ == "__main__":

    
    directory = "../src/webflow-licenses/"  # Replace with the path to your directory

    print("in main")
    print(find_duplicate_filenames(directory))


