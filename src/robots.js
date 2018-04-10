import React from 'react';

export const robots = [





{
    id:<img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`data:image/jpeg;base64,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` }/>,
    name:"Andrej Zadnik",

    website: <div> <a href="https://github.com/andrejza/" target="_blank" rel="noopener noreferrer">www.hipervision.eu</a>
            <br></br>

            <a href="https://www.linkedin.com/in/andrej-zadnik-3929233a/" target="_blank" rel="noopener noreferrer">andrejza</a> 
            </div>,

    jobTitle: "Full-Stack Dev, C++",

    location: "Stuttgart",
},


{
    id:<img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwkJCAgKCgoICAgICBYJCAgICBsLCQoWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6IyszODM4NzQtLisBCgoKDg0ODxAQDy0ZFRktKzctKysrLSsrKysrKy0rKystKy0tLisrKysrKysrLS0rNy0rKystKzcrLSstNystLf/AABEIAMgAyAMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAEBQMGAAIHAQj/xAA8EAACAQMCBAUACgIBAwMFAAABAgMABBESIQUTMUEGIlFhcQcUIzKBkaGxwfDR4TNCUvEVJHIWJVNikv/EABoBAAMBAQEBAAAAAAAAAAAAAAECAwAEBQb/xAAoEQACAgICAQMEAgMAAAAAAAAAAQIRAyESMUEEYXETMlGBIrEUFVL/2gAMAwEAAhEDEQA/AOfva4fYktp2wuSDWhXlgHU527gnT61eJeElY0PKheKZimBGMo1Vq94dJHGdLq2dirDIFbiCxMzrEVDFSuNQymSp7VG8qLIJI9YJJO64z7/lRqBQ2yjWuFeOYAbVlzZDYoy4YnKA+ZD7/h3oBIOHzNLdhVUmSRwkSA/ePv8AhXTPD/AbexJk0lriVSDM+wB6nHpVY8C8KP8A6ks33vq6MxIG4J6fzXQp2WHcrIyuMaUTUPxqkUSkzWVGBHmwxbGU6rQ7xMowjrpJ+4MECvSEJEhDxiJcopbGSff+KFkmyfIwCk4Ks4JJ9qahQjJL6d2JODyxutMLZuIEAwxyqoGR5S2fj0oXgt+kNw+uPCrsoGACPerZacf4eBgkRuCAdQwv4fFSm68WUivcVQ8Tv4VAaKQjOWQLjUfTennB+Kq5XncyMN91m/48/hRsd7ZTxnlPG6q4zpwADQd81gUbzaCBqKhcKxqLfsU/Y+SVGGVZWHqDmo5LiE5Uyxqx2IZhmub3/GntpiEkGkkjUD0z61C/HyYwG0s3UGTfUaqkxbRe+L8IgvQZYpBFcIuBIj+U/Nc/u+DfUpDkBXDkAIchhRcHGdSghTCQcnSxET/O/wCFNeFO3F4J3meOa6VtUYUaGQdNvb5rbRuyv+CePR2niK8s2cCOdAMMN8jH+6uvGJHDGSMeR8P5Rs5HXP6VxjxfIeH+IZmiws1rKAXQYJI9fwxXRbfxLb33BGYSi3kCYdnJ0xnofz61PIrsePgPPAvrEYkkciM4OncDJql3dlHb3cmsloQ3lyNyfbeul8BuYp7RFVkYKowVIZQPb1qh+OHaO9BjwFjPnULnJNLjk7o00AWsoRjpwjE5QOCSvfertwi2tLmyIuQpLqQzKMMpqh8NJkfSSGK/cIHWuj+FeCkIJ7kA75iTORVpInEo3FPCtpNfzRrcIyQ4YKAOaR8CgR4KmkAmit5bmFG0mSSQRR+9XHxUkPDuLQ3DRmG0mCJJcQg64snBP5VV/EPiqS9l0Qa4OHQMUhh1bSe7fPXepRTt70ijaSWtg3/07NYs0zchJGBZdbiXSayt7WRXgGNOpd/I5UMOu3tWVTj7icvYHlu2hnZYXcRAMxkO+o43zS6azWdJZF0kheaQrkN+/TpRN+r6F5aKzHysnYg9etLF4jHaAPLHzFCMn3c6c/7prBQjvsm6B6BwC+DgZHr8V7xCJmEb6gTjyENp2H815fAic6SSCNSgdxR3C7b6xdW0LkmF5lSQqu6r3/msHwXvwjZLacPj14NzcqJSHOWGf9fvTmVkIZcEsAfLnYHesubOJ+WDkCIDSyNg47fFeskMZBC4AONZGSB+NWRF9gywf9ePKV2J9aX3UETsW0hyvmVSTsPYUzY6NWWLDdhrG/4VVPFfHFtiEhkLXGv7VEQEAe/41noyVhYvbW0jmkdlQhtOR0642pHf+MoNDLHHhmzonUaS3zVTvJpbgyPIxOptQUbAfhQssesKNvKoK474qbZVRLJb+Lr2KQKHBQHSUxgHt+dNLDxeskxjm5gjdNQDkuEPtVFmR8ud9QfVtUi5Euobgbbeh3/ak6YaOrgLKisHEgddmz1FQPEzOFVScMAq561TeGcVlhdCMSppUvG2SCO+PxzV8tNVzBDcW6tNCR95U+0XHXpTqQriQaWRumDjDArjR80XwviMkEgaOQxurZLoMlRQro6M6nLHGXJ6YreOBixVsAyLmNgR5c+9F0wLRULlLniV/dYSSe5ubtsDTln3P8V0DgsHDLDgRi4piC4YEPAU1SgnJ3HX1GD7VR4Lq94RcSaspIE0iVHIOPbH71pecWkuASxWSRvvs7ZyT/Fc8rv2LxoMTxHccKeYcOnUWzSExh8sGH99K2F/d3qCa4zIwZXdyAFXfPr3qumI6QyAESIdKoMhangmlBVUwwP2bp97HTpWqvkF2X7gcUdxNbrbOrsWCsU8vL33BrrttCsEEcY+7EmMmvn7gfiZ7OeMMRiNw2XGjPzXQuI/SDZPYsqnU2nExTcKO+Kzk14MkT+Jb6C5uGZg5jhRopE20uff1rkXEZ7Yzzx27BlUh4tOfsz6e9NvGHiu9uGWz4erW1o0QKsmQ0oYDOcVUuIQ3ZWzCQyQtBD9o+kqrn1z3pMd3f5DPpKh7Yu/KGmUhZMK2jufb8f3rKVcDuZHWSJdLPy8MjqGGBXlWc4og3Rc5n1qrrgMFIAI29qrXFiV1RkY5nVeoA75pxJLhRnKAHJYt0+KrnE59UvuuQDmnGRrFDoK7EIGB052WnojBVfJoDHTCqDTIT6/7qvRcZEYVmhjZk2btqp54emfiT3F3JhFjUQxg5Kgneguwvod8LvroyqlzcSqpTSqahsPxp8zt1IIHXRnJOPX0qscUgk0BUIWBU0zO7AFz7etDW1zcW4P1jXJbwIWjPXWvTeq3RJodeIuNDhsLaQTJMCsY/7TXO47a4upmlctI0jZaRmLFvmmESS8UuWnm1mMt5EyQqAdgKtVlZQxBcKMD0pJOzox47KzbeHZ5AMISGG+e1ME8GT6QQVBG4BO4q62ejG2Pyo8Ae1Av9JFCXwhNoO6qw6HPWo28JTbZ0Zxuy10HQN8Yx8V4UG/QfhQoZY0c4k8M3EZVlBOARgU8+jziz8Mv2sLvCWl2480hGmJsfz3qzlPil/HODw3tqzIAk8fmQqOpqcjSxa0dCv+B206hhGMgZDxgAn4qrXvBhCwxGSCNQL5zjt/TWeCfEsh4a1lKWa8sjoUyHdl/wBUVLx6bD82IuoXSAmxJ6b7UIt3o5mq7KH404cwjgmwFVRod1yff09dqrHJTBHU7hjqAz8fNdF4zdfW7K6tpIGRpUIRugDdQRVC4dbmfV0YD7GRXGWx37fhTyFQ44LYWRtg0wYuT9mqtsnzUV1BDaSKNDBZGDLIjZJx06jvQ89gLeRDbTMqFfuA4396IsLy/DNCEtwp+8WQKQT81uKa9w20Jry0llYiPAcn7mAwPyK1s+H3EZkVE1SKCNBwCvx69ulXOTgryR8y65iiTyqIMhpB/e9D24t49K2xKhECx7/arihwZuSQFw/n27SPLask0YCBrlDlB13/AL2FCcZ4vbPNyYwZFJGtyuo59vQU0urRXJkkeSSVwR9pKTvQaJHGGKwqrrsz8sE5p1jr5Fc7FFrcwBXZoFgn5hZ5dH2rg9Kyj76B521GU7bqkik4B/vavalLC2+iUkmyGWUyRt0ClSQB0x7VXpDqkfr0LLnYECmE91ljoyBp69iKC0AuNWdJGCRVSqQMLYS+XSCxbyqoq6eGrX6taRxh5FaWTmBMEAfp8VX7CyluJUhUuolBWRlyuF75+PSrpnGMNhUULGhXykdPamihZM8hEetQq4k6M7sTilHiKUtHDHunPfmSIVxkDpTuKGPmkxkK0m2N9/71pB4oOm9txlSRGQxU5FFgitktjGEiBHTIzTJD0Ipdw+QMpXqCNqYwXFupw0iFhkFE877dc46VNnZGUYrboOtS+2M7Gm8THA7n5qLhVqt7CZICBEHKFmBXJ74op7GW3GfM6jroTV/NMhP83A3x+pswSYOMHpWupjnG9QSXcOknU2V6+T/dZb3QuJRHDFNIxXJ04AA96NN9FnljFOTdJEzBsf4rxCRkb7+1MBYuF3JBx93Y1DNEYwxIJAGTgUssb/Zy/wC09NdfUKzeu/D74XMOFLDD9gR3rafiMx0tNswTCgZBx2x7V7xeZHVZEOWjcMBnDLiiGQhG0sukjIV21E0Iprxs2SUZbi7TAm4ieSd5DhAA7rkofb260Fw6wgjhaTnW6SXLmREZSVGfX8fyoPicnK5gVFUPIzSOi4Ve5/xWtmYI7NZL2ZwjjUkEc5CgYpmhEE8RvuDWrj6zc3U0iuGSJSHi29Bn2rJfpDs42WOz4cFUjc6AJPkbVW+JDh0jj6tARJry7vIWKn3qfhdlHrYtGQjLljJkBj2z+NZILHl9xa5vQhmZlY+fQDhgCfX22phwuyXQGVWdkcFRg6fx71BawoVLOVDF8hn6n5pmskfKGllXC/eUAfPSrRRNkHFpysJMghVVUMCMCQf3ek1u2XI1sQzhpC6ahRN29xM5UoGtiNQZWPnGP7tUEllbJpJeaBgoy6zED9DisBE8rwAgXE5IGdCSHSG+PwxWUu5NrI4k1IrFRq5kgklB99z8+1ZWs1CLSoICgKx3L9c1JHAQmNYLaty8gXH60fEtlDGXlOtiuMK3T0pdNxezi3WESsDsZHO35VCmVsfeGLYpJNM2NIURgrkh/WrHzAz+ZTpIJAIH9980r8P3KXFlby8sMkiEOgAx3H9FM3VZCRqYgDSEOSBVETYJLbyK4IXDKdeFOQfz61W/E7f+9hGMYTURjFXJk1RjOCAunYbiqN4xdoLyN8gao8I0Z9M0JDRAry8lj5cKM6611Mw2Yg9Ks/hm11cPhMpfIuCY4NAww9j337VVLiWWKS0nVmEnIWSOQNhgwOdqdcK4xcKjEyAEkOQwHmPX+mufO2o6Of1SlOl4Ou+FrZ1hlgYW4WE7Rp/ypn1o6eApuB5ehFc54J45urNZJWEdxzAFIkJy2OlWiPx5azxqHt3WaRQQqNlTmuLDzUlbOLP6aDx6+5EHGIoYbnyxiSS4j1OpbAFR+F5Ua6mVGMTAESWuNQb0Of4oBeLC94lcyrpMKqIoSNwcf00u4pdXNjcTTWrGGScBllAGAR67dxXsRmoyvwds/TZJ+iUG/wCR0WVG9D6jbrQ8pUeWQhdQIGo4qnQ+O71Y15qRM6jQ/MTS2ffFEcQ4xNd2gkYiM6dWlBjH+68z1MnzuN7Z4P8AiONKxJ4iREugFkGlJNOs9PfNTy8SjNupikEitGDgA6o9u+1AXM7TWUlxIVeO3YjQB5nY9M++a94lYpDZBXZhdiDU8YBYYHX8etem6WODb2z6D0eOTxtVbQBPOsh3YgHLE9t/ilKwwm4XlKJCz6QrklT652/StYopJW5MZkkVXDmMOF5ZPX/xTq0sgGBKquwRQoGQPT+9e9Tq/gv0A2vDCro7EII2IbfLE/hTBJm84SMDDaQ8mTj3/u1HW5ZI2GSiuvnYR/aEd8UFcK+Fa1bGnLeZBkdhj+9KdJIVsOALnzyEQktgNHrZexGaOU8zSkbSKyeXU7jIA/oquI3EpVMsUkcghbmNhtII2Ptneh7XiVxq5xkVHBBIDeZ/72o2LRcYBqVSAJGU/dCka/XtXt/wmCbDaeVIU5jnWADn16Uut7m4kiZeTcTJKNZkQaJMn5oe/wCMX+qTmQXNurAxl5U+zaiYEvLEoJMKxWFyGcPkLWV7acMunKsY5ApIaR0QNvv0ryk4j8ihNNcOpYnAPfOa0jhMhVWDszHZR3pqlhnGWAUrrCg9BWkcZSSNgC2hs5A3IpLGG/AuMGCJbWNi4jOFViNJzvt/jvV5sGOHOoFcak8uSw965VCrRYPR1YOAex7Vvd8Su5MB5pAqAKiK5AUdsUeQHE6pfFORJpZY5BGdHmAJPtVN4hK09nIs4DFE1xuV3B9KqcfFbyOZJOdNIEk1FHcnV61dblUn4cWj3WdCUI7d96Vuy2JLjJAt1w4z2MIjwJIYwUJ21eoNJ1neLyOGjdGGtWGCB8VbuEustnD3BQA0QeGQyEFlDD0IyBSt/kEsHOqKvwpVupimSII1LKCcZPqaZOTq5MSktpIkkzhVHtTWVbWAFU0ooG5pFNerHJIEbAkGS4xkVNQ3YsfTRTtuyycCMcXLjyA6gBwadX8MMqFGKkyKQhPY9q5/wyeVLlZOc0qgkaXUA/hii+IcVjndSXn8mccuQoo+fWnbfR1xaSoNuLB45ArqDhxl1GSw/namFwObYxqjxpIPIY0BGB29M0useK27R6JmYEjyu2S1PuFXUbHTlJBjKON9QoLW2rOXL6LFkkndNAHCuH3D/wDP5baOQSxwnGXb1P41LxODWmvJGbcg4O5JGNv1p7MyhdsDNVu+uSLWEDSQSwYsfukE4p+Tm1fg6OKwwdANpBHAmlVREVcsAuqRsdc/7ogIAsmEJfOUGjdfehjK+pSjCMnyurrgsf0reyeTTJg8tQpWPKEEntjAqyRwthEUDSRJ9YJhjGWGFKs4qN44+WF1N9mh0E/ek/GpwBr3casgl3P/ADE4FRrahZjIra4w3nBbJx7fztTULYNDbOhbRpBfIONtj6/p+dNYbe3SF1dRCFU5CpsQOtSQ26syO8mGKlij50sDsP70ojUy8lWQKZ0GHY6vvdK1IFkSGGMcu3PmZSA6pkr7e21E2LnSGnaSWAMdWV17epz+WfmtJ/IFkBVmTzSIJBkgdc7nruAaFuLl0RByyJSmp4XPVSOhz7ZpnRhvBdoZiEjjjAk0lHBDEHbGPQjG9ZS21EE8azKeWEtjIrBtsd8/rXlLYCg6NiwUbrsNgD8VE6YIQ5OU20rsfamFsYiqdY2U5csuVb+moZX1Sxg40q+xyPL7/nvUC9i6YebGnUFHTG2aCdNm7gH02/Cj2ClCRnyjyvnYHP61GkII6ADGNR3oBF/JBxtucYNW7wsrNazwzf8AHHkoM9R/HekcMCCVBuVDb05jQxK+mTlalIDdDWDF0SeHbpYwYnbCq5VP2FWaXMdpNLgnlxFwB1Nc2t5ijTKCdQbKn1q6cF4qLm2kik/7Dr1H0pWi0JFekuJLjXIzFYy3U7AVLBBay48zOcY8oJq2WdjbfV2CgAqvQ4ODUMFtGrHVCpAPUDFFIZIBsrKCID7GZwO5Rs/pRsdha4Y/VGXWMnKEfzRNxxeytV0lVVsbAnNHcM4zZXGAOSGPQMRTOh04iO8sInTEdtMD3ZFzihODNPZcQijkVxFI2nzDYelXiT4VR2xVZ4nf25vlhYKGVNYbHekrsE6VNDTit8kAZSQGEZYb5xVQN7HJCqkgsWO2RjBOd/72qLifEObNI2TgIcZoAKqxr58sAGI6YJpsaohllY8kkjhjXdtRAyx2/uK2+t6yuwEZAOpmJY9OtB2/La2jkYu9wzEYYjyjOBR3Do1XUzjmNkIFOxPbb+9KujmZNIvMichEmIYFkLFSgH+qcWli0EJaQRhYzqjAfUqL3/npWkdv5hy1WRSchgAIwd+h79hXsnOUFEVJHiTW/nCmPtvv8bd96LFJ1kCyys2oQsvLwyHSBjtt0z0/3UnBGilh5jqAEAEWdiwHt8etDfXmk1W+lpSSfIoIDMOoP71kbvFNH5jqZCpkVSQp9/2oAN5UW4kcKxaMkFcSao8dv0qG9ZFeWFo9TQYKqhPMf4HxRtvanVO8jQst1FphUMckgb59f9VHc23NuJJCrI9qpjtXicvLIdgO3r60GwoX8Nla74deIEjQsAYY2BwwX/p679h+lZTu1sgJA7kxo6ERK40lfXOD8796ygK2cyFw0etdwQmwBJwfT2qDzsjhy3Q4wOvzUpkjk8yKBhQGbsT3qOZiyfdC4O+SBqqdnRR6xLFFGCuAXCjAzjvUjppQ4wQB1OxJqKEsQxYEA+Zyuyk17JNpVlBYjXggbasUAkcTnWMASDVq67CjzK0ijVkKvXV2Hah7dI9DM0yII1BlRWHlx2PvQ93xuNOYLeJWAGkPIM5pqAAX2Y7l3AIQnYge1S2t40YO+CdwaOsYH4pw91DL9Yjly/kABBpJPbzQMVdWXDYyRsaHkenSZYbXjcyxhFYjJBfJ3Jol/EsscDdA7HYelVaCcqewznIr2dsk75Bom5MbiVZWM0wDADcE5reyki1EReUg+Q6sGlUcuE077rpNSRtylPQtr65oBUizQeIbiICGRmcZwG1b0lvbp2ndyxDHOkk52oR5NThsgYbze9SQ2dxdyKsUbMG8qsRsPmgG2yPnGSQFiSuQzfFNuF2xd2l0gy8zSqkgKPTFWzwv4Ns3dIrovI9yoVmVtJQ9cCn939G7W4Z7GTmqE8sEg0y+ux7/AKVSEb2SyPjSZT7eCCKMLNgPg+T7wc4zjr8ZqcxSSOj6NEMLBkJPU+vvv0NC3KNZXZivWFq6HVybl8GMnpgfnTGJIpyUR4+SynmvCQFb29PWqpErHtpPEsCSZkIMutteQEG+cZ9s7UDPfR3DzLE8io8fMt50crJE23X56fjXlhGMR6XYqdi8jhmVT269xXl09jyxHDJGzmcaChxESein1/D0oMCBraxmmngk126vKOYvLcZTG/z6UfZKYZGVwpQMWYnDRlhv++TWi8u2S4aZV5kUqxxpoB0E/wB/SgzetdqOS3NLSDmR4Blb3HT4x7VjDWaeTmKwUSQ8kqFVgsikdvbaohxqG2uQG1ZkYaIowTqA9fx261P5rfeGRYwIyr26oU1MOuP1FaQcEtp2jN47vMX59u6SGOWM9f37UGACv7p4ryRU1yWTDmtEr5+rgY/IZ+BWUx4zZStLHLA0aRk6b4Ef8qjY5/uK8oGTOdKuoHyqoPbGciom2YhVIK+XURqI+ajWRxkhtCn7ultgPap41aQoq8xnL5ULlgx/8/vUjoIxr3HnORlmAPehuIM8ICsHSQYIJ2Irp3CfAJ+rLcX8jxTSESfVUUZT5P8AiuYcfXTxW9j1Myw3TRJrOTgdKqsTpNk+d3Rk/CubCZYQQRHzOWxzJID3H70nUdR6jNOuGXfLbllipyOS4bGk1Fxe0IcTKukOcyBVwM+3pvRoI6+j4KzXKHGQQ2PamfHeFpKWyo3OR6iqt4VvRa8RXU2lJhy2Poe361f5F5oJ6+lQkt2dWN3Cii3PClGygAjuKFPDcrjJDY6GrrNYB1OwBO4z60G3DjqGw/CtYrgVVeGXBzgA+mO9Tx8GuXdQdKjIy2c6at1tw7ocEAUwgstO5AJztWsCgVuz8OxjSZC0mN8Ywpqy2VqEwI1CKPugdBRggG2wHvijIItAHrQKRjQbwTy3lkSBkTg/FdC1COVVOAkuyn0NUrw3b8/iEQ6rHmRseg6fxV1vYTJA6qcOnmRh1UjpVof2cvqfuXsJPGvhnhvGLGQXkAaSJCYbqMYniPsf4NfO88lzwy4ubWK4cLHIUOD9nJj1FfTpuhJYmUgZ0YkX0NfM3i8BeM3+np9ZJH5VeMf4vW0Qg9v8Fi4Bxq3ubZoNKQ3co6l9Kufb+BRlrGq3So2kRqBkONQHxnrj0rnMDlehIINWrw/x5Obbw3R0qo5UVwuBy8+vt7/jU2UaGQ41NeT4mBhVcxvM421DoD03/wAUxtraOCwmuFlFvJLOrW7LjmgD0/X/AMVFecLjt2TkxlnKcyVwhOGHQ96jldZ3GolAr6khiU8xyOm3xSgJrqWWARyrK89qrBJvrJAKH1H4URZLc8QYyySrJDaxF7eWBwxSQYzn8MDB7d6EYh4pI5o1V41MsHOAUKTkdxvvS/gk80HEGjjAigupmVY2BJKjY498frQu70Z9F0uIrp4pNQUro0yIVOJB/wCeuN69oHhd4kL3Nvpup7NUM0l1Mx+zz+wx+1ZRJHPre1muZlt40eZ2YJGEGnf3/U10vwd4QSymS4uMTXMa6kVR9nGfamPhPwnFw9OY+JLt1879kHoKs6Q8pww6HY1048Sgt7YcmW9LonKAwI/XC9a+d/Htr9W8R8TXGA9xzV+DX0OZeUFj20MfsyemfQ1xL6XLGSLi0c7qR9ZhxnqCRt/ijWmJjeykEZz6U44feCaF7eXBkVfIzb5/z6Gk2enuM1hYoyuuzKcg1Ki5te25hkDYKqx2/wD1NX/gcsknD7WZ/MHQqXHqOx/veqyoS+tc7BgMPjcjH+P2roH0f8OZ+ClXUSKlwySJ19wR/mssXO1dDxy8CAJq/LrUMkWlh3FWG44FIMm3OsY/422kHxSyeEqdLqVZfvBlwQahLFKD2joWRS6ZDAygjOAc96ZKq4HTcZFKpFGO4I6GpYZmAAZgcbVOiiYeOp7mpQ2APYb0NE3Q7AZ3JrFSa9uI7O2BMszaWYdIx3J9q0VYZSpF18CW+YLi7Ixzn5cR9VH+6sDnTN7SLissLWOztILaPaOCMRrnqfevbgbA91OatE8zNK2LEPKuLu3ONM6GRAenvXzd4sX/AO8Xw3OLkj8K+juO5j+r3S5+zbz49O9fPXjaEJx7iKj7pnLqfnBrrq4X+f7Fg9ldTYt28x2qT+4rUffb0rZR0qFFzqVpYcQuOB2XE4GN5G0QMupsyRMuQQfnFKYFYfaNGVJiId9ZBz7em1XP6C74S8Mv7Ft/q1zzUU+jDf8AUU+8UeDTcI0vDjHb3AOowlQsUnr2pRORyo8Qs5kuEvJHRgSo0JqjLA9R7daW8Sc3ICLIJmtziKQsFkZcZ3/I0ZxDgl5bXjRXVrInlEbIhzrJ6afnejrC1t15lvMghkAYxzsAs0IC+YnHyCPitQRrYu8fBBMczyRwjmQIMSdN1OfT/dZQPBuKMLW1RuRyjOIpiTpVxsN9uuf3rKFE38HU1nK9NqkF5nZlyPaoYLYuR5SB80etqqgdjXdNxXyQMj5cyFM5B3APVa5t9MPDZG4dDcEZa0uNDsB/0t0P510oIFYEYyKSfSVCs3hviDYz/wC39O4IP+aldP2YY9o+clG3w1ev92vIx94delbsPL8UtHUG+H7mOC7QTNotpnCSP2j9D/n2rsXhBpeF3Rs5cC3nOu2cbqT3FcTitJ3GFjkJKggFCM/jXVfBHEFv+CJDcSJHdWEnLgkkcBhjp+X8VTGrtUTyI6ZNZxSYZMRyHfT2JoC94YsqlZo1cgYBYYYfBrThHEkurfSWUyKNLBWBwRRUV6wJRmyV6BvMDW4y2u0iSbXRUuIeHWBJhfB7JPt+RFKTwziKtgWrN6Mjqw/euliSJ8B40OfRsVusNuN+SufdqlKEf+S8fUyXuUSw8PcRuCFZUtwdiSwdgPwq8eH+BW/DIzpBedx9pM+8j0ZFIOihUHooqYN+vU1Jr2oWWdyN5G2NYwyh9xUczeU17E2UHehRG+wa4QS2s0ZGohNlPevnbx/EF4wx6h4lOfjb/FfRWvTLjsdq4N9Ldt9X43jGEaPWnxn/AM10QdRkhsb2UYgCTbpipAv4io5OqnqTkVOB0PY0vk6LL59DPEfqviJYCSEv4DERnYsNx/NfQIFfKnh+9NjxXh90Dj6vdLIx9gd/0zX1TG4ZVYbhhqB9alkVUAUeI+BxcSgHSO5hfm282nOlh2PtXFfECtGt3DdR6eJQ3hEilQokX1H+a+hK5/8ASV4YjuuVxGNSJoMR3Ghc60z3FCD8AetnNFsXg4bBKI2kIczMqoXCkb7/AAKyrWsgkdrVtIhiAZAnlIO2B+4rKNiuXsdMVNPx+1bNjGex71gfbfG3WsKjcdQRginOZEbrqBxjUN1HrSfxYvO8N8ZXGStk7gHqMDNM3YqPdT19aG4xhuG8SG2mfh8gb0zpNM0Ou0fMSjDn4rZujVtjdu2CajySD3yaazpHfFWLoI/MUFoGGM4DdQar4PfuetHT8S1SRs8K5jQKCrkHAorgfhm84nGZYTGkHM0BpGOf2rNuT0Za7FkUrxsGjZo2HR42KkflTW08ScXtiDHfXQCnZXkMg/XNWEfRxd6CVuoGYLq06CM0FL4E4wrHTFHKCRhkmGD+1FKaA3ENtPpI4vGoEq20+O5Qox/I0/sfpVXSFuLJwehaGUEftVJufCXGYM6rOZwO8WJP2JpXcWVxB/ywzQnp9pGU/cUzk/KF4xZ121+krhbEajcwg9niz+xNO7bx1wibGm+gQntKxj/fFfP7MR6itC7FSeigbD1rOS8xB9NH0beeI7VIw31iFlYZQo4fV8UqvfG8NpC2hlnmOBHGGxk/4rjPDLx4ZOHx6wlvKwec43xq3x6bU8hunmeZljBVCfqzyDJ9v4o8o19oPpr8lo4j9JzW8gSS2ZplUM+iQADPbpVG8a+KP/X5beUwG3eBDGxLhtQoReCcVvJJHFvNM5fzuq/Z/ga1vPDvEbSFpri2khhVgGdiDgnbsaRyk19uh1GK+TfgttBcaUkhDBHBeTUQ2/T4qG/gEFxNEowkchVBnOB2/SpuFTwwRu7uqgOraQmuQn2H81pxa6jnuZJYw2mTB8wwc4oePc3kG/7fmvp3wdefW+B8JmJy0lioc+pAwa+YNWcYxsRkV9CfRVMX8OcPX/8AGHUf/wBGkyK0CWqLuKiuIlljdGAZHXSwPcVsprY1zjXaON+IeZY301rGrCSAmUSv5VKDB/b96yrP9J8KxWyXOQplQ27Ej9v1/KsqqVoX9FpY6WPp/FYW2I7jpn0rKyqHMgec/d9DsaA49Jy+C8TffMVk7jH/AMTWVlP4RReD5uc45vzUHYdOm21ZWUjOlHmMgZ711/wDw8x8DtmIwZWaX8Cdv0rysquBfyZPI9IuVrF9z0YaDW3K0kr/ANpx+FZWV0dMiZJF07g0vuYevoayspltGKR44ubSzteX9XtpLu5GELwKxjHc7jr6VzcjOe+ewr2srly9l49F1t/AHEWmtPNGYUhXU5OCPWr7wLwrBAY0kVZWI0vqXK4rKyqKKSdEpSZbYeB28ChI0VEHRVG1LPFfAFueEcQhRQXktWaIY/6huP1FZWVzxyy1slez55dBqHuM1HKPMv8A8MV5WUWdaPVJ9dvSvoP6KkMfh60J2BVnGf8A5GsrKV/axMnRdoz5R6kb1JmsrK5wRYj8ZcNS/wCEzxsCeX9smNiCP9VlZWVXH0GXZ//Z` }/>,
    name: "Mitch Hankins",

    website: <div> <a href="https://github.com/IronCoderXYZ" target="_blank" rel="noopener noreferrer">www.somewebsite.com</a>
            <br></br>

            <a href="https://www.linkedin.com/in/IronCoderXYZ/" target="_blank" rel="noopener noreferrer">username</a>
            </div>,

    jobTitle: "Full-Stack JavaScript Dev",

    location: "Denver, CO USA",
},

{ 
    id:"",
    name:"Piyush Gupta",

    website: <div> <a href="http://pdshah.com/" target="_blank" rel="noopener noreferrer">Cold Storage</a>
            <br></br>
            <a href="https://www.linkedin.com/in/piyush-gupta-3a268826"target="_blank" rel="noopener noreferrer">linkedin</a>
            </div>,

    jobTitle: "Full-Stack Developer",

    location: "India",
},

{ 
    id:"",
    name:"Gary Hicks",

    website: <div> <a href="https://www.traceofwind.com" target="_blank" rel="noopener noreferrer">www.traceofwind.com</a>
            <br></br>
             <a href="https://www.linkedin.com/in/traceofwind/" target="_blank" rel="noopener noreferrer">traceofwind</a>
             </div>,

    jobTitle:"Full-Stack Designer",

    location: "London, England",
},


{
    id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars2.githubusercontent.com/u/22373538?s=460&v=4` }/>,
    name:"Dylan Thorwaldson",

    website: <div> <a href="http://www.dylanthorwaldson.com" target="_blank" rel="noopener noreferrer">Portfolio Site |</a>
            <br></br>
            <a href="https://www.github.com/dtthor" target="_blank" rel="noopener noreferrer"> Github Page</a>
            <br></br>
            <a href="https://linkedin.com/in/dtthor" target="_blank" rel="noopener noreferrer">dtthor</a>
            </div>,

    jobTitle: "Fullstack Web Developer",

    location: "Austin, TX USA",
},


{
    id:<img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`data:image/jpeg;base64,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` }/>,
    name:"James Granfield",

    website: <div> <a href="https://github.com/googlr" target="_blank" rel="noopener noreferrer">github.com/googlr</a>
            <br></br>

            <a href="https://www.linkedin.com/in/xiujia-guo-88697181/" target="_blank" rel="noopener noreferrer">James's LinkedIn</a>
            </div>,

    jobTitle:"Software Engineer/ Developer",
    
    location:"New York City, NY USA",
},

{ 
    id:<img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://ktran031.github.io/kt_portfolio/images/khoi.jpg` }/>,
    name:"Khoi Tran",

    website: <div> <a href="https://ktran031.github.io/kt_portfolio" target="_blank" rel="noopener noreferrer">Khoi Tran's Porfolio</a>
    <br></br>
    <a href="https://www.linkedin.com/in/khoi-tran-35564991/" target="_blank" rel="noopener noreferrer">Khoi Tran's LinkedIn</a>
    </div>,

    jobTitle:"Front End Developer",

    location:"Orange County, CA USA",
},


{
    id:<img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C5603AQHrnJjaX7E8Sw/profile-displayphoto-shrink_800_800/0?e=1528254000&v=beta&t=PWYVA_XZigZXr4rtNkcdRZiqFyv2IVmoRov0GSepi3A` }/>,
    name:"Pak Chu",

    website: <div> <a href="https://github.com/spaceforestchu" target="_blank" rel="noopener noreferrer">github.com/spaceforestchu</a>
            <br></br>
            <a href="https://www.linkedin.com/in/pakchu" target="_blank" rel="noopener noreferrer">pakchu</a>
            </div>,

   jobTitle: "Fullstack (Javascript Developer)",

    location:" New York City, NY USA",

},



{
    id:<img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`http://www.swapnilgaikwad.tech/assets/images/profile_pic1.jpg` }/>,
    name:"Swapnil Gaikwad",

    website: <div> <a href="http://www.swapnilgaikwad.tech" target="_blank" rel="noopener noreferrer">github.com/Swapnil2095</a>
            <br></br>
            <a href="https://www.linkedin.com/in/swapnil-gaikwad-2095" target="_blank" rel="noopener noreferrer">Swapnil2095</a>
            </div>,

    jobTitle:<div> Fullstack Developer <br></br> Data Scientist(BigData, ML, NLP) </div>,

    location:"Pune, INDIA",
},

{
    id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars1.githubusercontent.com/u/32341221?s=460&v=4` }/>,
    name:"Nabeel Siddiqui",

    website: <div> <a href="https://github.com/nsiddiqui25" target="_blank" rel="noopener noreferrer">Nabeel's Portfolio</a>
    <br></br>
    <a href="https://www.linkedin.com/in/nsiddiqui25/" target="_blank" rel="noopener noreferrer">Nabeel's LinkedIn</a>
    </div>,
    jobTitle: "Full-Stack JavaScript Developer",

    location: "Chicago, IL USA",
},

{ 
    id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars2.githubusercontent.com/u/32417757?s=460&v=4` }/>,
    name: "Martín Comito",

    website: <div> <a href="https://github.com/martincomito" target="_blank" rel="noopener noreferrer">github.com/martincomito</a>
    <br></br>
    <a href="https://www.linkedin.com/in/mart%C3%ADn-comito-627a32153/" target="_blank" rel="noopener noreferrer">martincomito</a>
    </div>,
    jobTitle: "Front-End Developer",

    location: "Buenos Aires, Argentina",
},

{
id:<img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars2.githubusercontent.com/u/17670025?s=460&v=4` }/>,
name:"Krishnanath Maly",

website:<div> <a href="https://github.com/krishnanath" target="_blank" rel="noopener noreferrer">GitHub</a>
<br></br>
<a href="http://www.crzna.com" target="_blank" rel="noopener noreferrer">website</a>
<br></br>
<a href="https://www.linkedin.com/in/krishnanath/">LinkedIn</a>
</div>,

jobTitle: "Full Stack Developer",

location: "Malayattoor KL, INDIA",
},                    

{
id:<img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`http://oudia15.github.io/Images/me_linkedin.jpg` }/>,
name:"Oumar Diarra",

website:<div> <a href="http://oudia15.github.io" target="_blank" rel="noopener noreferrer">oudia15.github.io</a>
<br></br>
<a href="https://www.linkedin.com/in/diarraoumar/" target="_blank" rel="noopener noreferrer">diarraoumar</a>
</div>,

jobTitle: "Full stack Developer",

location: "Louisiana USA (Willing to Relocate)",
},

{
id:"",
name:"James Chhun",

wedsite: <div><a href="https://wingchhun.github.io/portfolio.github.io//" target="_blank" rel="noopener noreferrer">James's Portfolio Website</a>
<br></br>
<a href="https://www.linkedin.com/in/james-chhun-16b1b5120/" target="_blank" rel="noopener noreferrer">James's LinkedIn</a>
</div>,
jobTitle:"Front-End Developer",

location: "San Diego, CA USA",
},
{

id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C5603AQFJuMW6DO74xw/profile-displayphoto-shrink_800_800/0?e=1528477200&v=beta&t=O952AL-tutZW3Z0aAaGIjS7jxLDFST_5Lzodga0_uj0` }/>,

name:"Ismael Vazquez",

website:<div> <a href="https://iamismael.com" target="_blank" rel="noopener noreferrer">I build great websites!</a>
<br></br>
<a href="https://www.linkedin.com/in/ismael-vazquez-jr-0415a1104/" target="_blank" rel="noopener noreferrer">Get to know me</a>
</div>,
jobTitle: "Full-stack Javascript Developer",

location: "Los Angeles, CA USA",
},

{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C4D03AQEdhmhOXXRi7g/profile-displayphoto-shrink_800_800/0?e=1528477200&v=beta&t=Ibu6t9ZiYsqch12H9_wwvvx4bT8vU95QPAq1Mubl0Dc` }/>,
name:"Adrian Wagener",

website: <div><a href="https://wagad22.github.io/" target="_blank" rel="noopener noreferrer">www.adrian-wagener.com</a>
<br></br>
<a href="https://www.linkedin.com/in/adrian-wagener-45b741134/" target="_blank" rel="noopener noreferrer">See my cv!</a>
</div>,
jobTitle:"Fullstack Webdeveloper",

location: "Frankfurt, Germany",

},
{

id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://nadyafa.com/pics/nadezhdafalaleeva.jpg` }/>,
name:"Nadezhda Falaleeva",

website: <div><a href="http://nadyafa.com" target="_blank" rel="noopener noreferrer">Hopes91</a>
<br></br>
<a href="https://github.com/hopes91" target="_blank" rel="noopener noreferrer">Hopes91/Github</a>
</div>,

jobTitle:"Front-End Developer",

location: "Kirov, Russia",
},                     

{             
id:"",
name:"Chirag Chopra",

website: <div><a href="https://github.com/chiggy1997" target="_blank" rel="noopener noreferrer">https://github.com/chiggy1997</a>
</div>,

jobTitle:"Full Stack Web Developer",

location: "Mumbai , India",

},

{     
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://murilomiranda.github.io/img/my_picture.jpg` }/>,
name:"Murilo Miranda Nüßlein",

website: <div><a href="https://murilomiranda.github.io/" target="_blank" rel="noopener noreferrer">Murilo's Portfolio</a>
<br></br>
<a href="https://www.linkedin.com/in/murilo-miranda-nuesslein" target="_blank" rel="noopener noreferrer">Murilo's LinkedIn</a>
</div>,
jobTitle: "Front-end Web Development",

location: "Berlin, Germany",
},                  

{ 
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars1.githubusercontent.com/u/2739361?s=460&v=4` }/>,
name:"Christine Aqui",

website: <div><a href="https://github.com/christine-aqui/" target="_blank" rel="noopener noreferrer">Christine's GitHub</a>
<br></br>
<a href="https://ca.linkedin.com/in/christineaqui" target="_blank" rel="noopener noreferrer">Christine's Linkedin</a>
</div>,
jobTitle: "Full-Stack Javascript Developer",

location: "Toronto, On Canada",
},


{

id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars3.githubusercontent.com/u/8761960?s=460&v=4` }/>,
name:"Sheel Parekh",

website: <div><a href="https://github.com/RizaneEves" target="_blank" rel="noopener noreferrer">RizaneEves</a>
<br></br>
<a href="https://www.linkedin.com/in/sheelparekh" target="_blank" rel="noopener noreferrer">sheelparekh</a>
</div>,
jobTitle: "Full Stack Developer",

location: "Champaign, IL USA (Willing to relocate!)",
},                      


{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`http://rabinrai.com/wp-content/uploads/2017/11/rbn_img-300x225.jpg` }/>,
name:"Rabin Rai",

website: <div><a href="http://rabinrai.com" target="_blank" rel="noopener noreferrer">Portfolio Site</a> 
<br></br>
<a  href="http://github.com/rabinrai44" target="_blank" rel="noopener noreferrer">GitHub Profile</a>
<br></br>
<a href="https://www.linkedin.com/in/rabin-rai-58a43913a/" target="_blank" rel="noopener noreferrer">Linkedin Profile</a>
</div>,

jobTitle: "Front-End Web Developer",

location: "Grand Rapids, MI USA  (Remote or Onsite)",


},


{
id:"",
name:"Oladele Olorunsola",

wesite:<div> <a href="https://github.com/deluxscript" target="_blank" rel="noopener noreferrer">Deluxscript</a>
<br></br>
<a href="https://www.linkedin.com/in/oladele-olorunsola-707a2175" target="_blank" rel="noopener noreferrer">Oladele Olorunsola</a>
</div>,
jobTitle:"Full Stack Developer",

location: "Lagos, NGA",

},                          

{
id:"",
name:"Danny Ferguson",

website: <div><a href="https://dandzn.com" target="_blank" rel="noopener noreferrer">Dandzn.com</a>
<br></br>
<a href="https://www.linkedin.com/in/adannyferguson/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>,
jobTitle: "Front-End Developer",

location: "Gaspésie, Québec (Willing to relocate)",

},
{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars0.githubusercontent.com/u/35478461?s=460&v=4` }/>,
name:"Kirtiben Parekh",

website:<div> <a href="https://github.com/kirti010" target="_blank" rel="noopener noreferrer">Github Profile</a>
<br></br>
<a href="https://www.linkedin.com/in/kirti010/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>,
jobTitle: "Front-End Developer",

location: "San Jose, CA USA (Willing to relocate)",

},
{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C4D03AQGcf89ACxun0Q/profile-displayphoto-shrink_800_800/0?e=1528549200&v=beta&t=4-3H7jB8ADFrpOZDrDr9T4ZJhTFl88OVq034R3j4svU` }/>,
name:"Piotr Kowalski",

website: <div><a href="https://github.com/piotrke" target="_blank" rel="noopener noreferrer">Github</a>
<br></br>
<a href="https://www.linkedin.com/in/piotr-kowalski-57379a120/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>,
jobTitle: "Full-Stack .NET Developer",

location: "Poland",

},
{
id:<img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars2.githubusercontent.com/u/25475754?s=460&v=4` }/>,
name:"Kgothatso Desmond",

website: <div><a href="https://github.com/DesmondThema" target="_blank" rel="noopener noreferrer">Github Profile</a>
<br></br>
<a href="https://www.linkedin.com/in/kgothatso-desmond-45b380b2/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>,
jobTitle: <div>Web Developer<br></br> (NodeJs, PHP and Magento)</div>,

location: "Cape Town, South Africa",

},

{                       
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars3.githubusercontent.com/u/26254354?s=460&v=4` }/>,
name:"Isaac Zhou",

website: <div><a href="https://github.com/isaaczhou" target="_blank" rel="noopener noreferrer">Isaac Zhou</a>
<br></br>
<a href="https://www.linkedin.com/in/isaaczhou/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>,
jobTitle: "Chief Data Scientist",

location: "New York City, New York USA", 

},
{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://abdusdev.me/assets/img/profile.jpg` }/>,
name:"Abdus Samad",

website: <div><a href="https://abdusdev.me" target="_blank" rel="noopener noreferrer">Portfolio Website</a> 
<br></br>
<a href="https://github.com/thisisabdus" target="_blank" rel="noopener noreferrer">Github</a>
<br></br>
<a href="https://www.linkedin.com/in/thisisabdus/" target="_blank" rel="noopener noreferrer">thisisAbdus</a>
</div>,
jobTitle: "Web Developer",

location: "Assam, India",


},

{                       
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://mohammedmulazada.nl/img/moniac/cutout2.svg` }/>,
name:"Mohammed Mulazada",

website: <div><a href="https://mohammedmulazada.nl" target="_blank" rel="noopener noreferrer">Portfolio Website</a> 
<br></br>
<a href="https://github.com/moniac" target="_blank" rel="noopener noreferrer">Github</a>
<br></br>
<a href="https://www.linkedin.com/in/mohammed-mulazada-81096b5b/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>,
jobTitle: "Front-End Developer",

location: "Amsterdam, Netherlands",

},


{
id:"",
name:"Yuan Li",

website:<div> <a href="https://github.com/tinauwtron/tinauwtron.github.io" target="_blank" rel="noopener noreferrer">Yuan's Github</a>
</div>,

jobTitle: "Front End Web Developer",

location: "Toronto, Ontario Canada",
},                        

{   
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars0.githubusercontent.com/u/8077875?s=460&v=4` }/>,
name:"Joe Horn",

website: <div><a href="https://github.com/joejhorn" target="_blank" rel="noopener noreferrer">GitHub</a>
<br></br>
<a href="https://www.linkedin.com/in/joe-horn-3b306b1/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>,
jobTitle: "Front-End Developer",


location: "Reno, Nevada USA",

},

{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://mikerodev.com/assets/images/HeadshotFeb18.jpg` }/>,
name:"Michael Robards",

website:<div> <a href="https://mikerodev.com" target="_blank" rel="noopener noreferrer">mikerodev.com</a>
<br></br>
<a href="https://www.linkedin.com/in/michael-j-robards-630526138/" target="_blank" rel="noopener noreferrer">Michael J Robards</a>
</div>,
jobTitle:"Software Engineer",

location: "Atlanta, Ga USA",

},

{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars2.githubusercontent.com/u/740101?s=460&v=4` }/>,
name:"Waqar Goraya",

website: <div><a href="https://github.com/waqar3" target="_blank" rel="noopener noreferrer">github.com/waqar3</a>
<br></br>
<a href="https://linkedin.com/waqargoraya" target="_blank" rel="noopener noreferrer">waqargoraya</a>
</div>,
jobTitle: "Web Developer",

location: "Portsmouth, UK",

},

{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`http://malikvishal.me/assets/images/vishal.jpg` }/>,
name:"Vishal Malik",

website: <div><a href="https://github.com/vishal0027" target="_blank" rel="noopener noreferrer">My Github Account</a> 
<br></br>
<a href="http://malikvishal.me" target="_blank" rel="noopener noreferrer">Portfolio website</a>
<br></br>
<a href="https://www.linkedin.com/in/vishal0027" target="_blank" rel="noopener noreferrer">My Linkedin</a>
</div>,

jobTitle: "Web Developer",

location: "Toronto, ON Canada",

},
{
id:"",
name:"Yifang Di",

website:<div> <a href="https://yifangdi.blogspot.com/" target="_blank" rel="noopener noreferrer">blog</a>
<br></br>
<a href="https://github.com/YvonneD" target="_blank" rel="noopener noreferrer">Github</a>
</div>,


jobTitle:"Front-end Web Developer",

location: "Flint, MI USA",
},   


{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars0.githubusercontent.com/u/23562296?s=460&v=4` }/>,
name:"Zans Litinskis",

website:<div> <a href="https://magvin.github.io/" target="_blank" rel="noopener noreferrer">My Portfolio</a>
<br></br>
<a href="https://github.com/Magvin" target="_blank" rel="noopener noreferrer">Github</a>
<br></br>
<a href="https://www.linkedin.com/in/jeanlitinskis" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>,

jobTitle:"Freelance Front-end Web Developer",

location: "Eastbourne,United Kingdom",
},




{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C4D03AQE-1w0mjbpHeA/profile-displayphoto-shrink_800_800/0?e=1528552800&v=beta&t=AQa2nhly_-ikre7ozynBY2YxWEIvo55T1a2Lj2aWB8g` }/>,
name:"Els",

website: <div><a href="https://www.bloobloons.com" target="_blank" rel="noopener noreferrer">bloobloons</a>
<br></br>
<a href="https://www.linkedin.com/in/bloobloons" target="_blank" rel="noopener noreferrer">More about me</a>
</div>,
jobTitle:"Full Stack Developer",

location: "Portsmouth, UK",

},


{
id:"",
name:"Aminul Islam",

website:<div> <a href="https://github.com/amin135" target="_blank" rel="noopener noreferrer">https://github.com/amin135</a>
</div>,
jobTitle:"Full Stack Web Developer",

location: "Totowa, NJ USA",
},


{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C5103AQEnRmgvAyGi8g/profile-displayphoto-shrink_800_800/0?e=1528552800&v=beta&t=OfUQbBBxFjOcvpZYflHT4LS5eBi3ImU1WKJZVG7zRug` }/>,
name:"Priyanshu Tyagi",

website:<div> <a href="https://github.com/priyanshugithub" target="_blank" rel="noopener noreferrer">Priyanshu's Portfolio</a>
<br></br>
<a href="https://www.linkedin.com/in/priyanshutyagi1996/" target="_blank" rel="noopener noreferrer">Priyanshu's LinkedIn</a>
</div>,
jobTitle:"Full-Stack JavaScript Developer",

location: "New Delhi,India (Willing to Relocate)",

},

{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars3.githubusercontent.com/u/33874571?s=460&v=4` }/>,
name:"Amadi Lucky",

website: <div><a href="https://github.com/w3bh4ck" target="_blank" rel="noopener noreferrer">Lucky's Portfolio</a>
<br></br>
<a href="https://www.linkedin.com/in/lucky-amadi-40408b41/" target="_blank" rel="noopener noreferrer">Lucky's LinkedIn</a>
</div>,
jobTitle:"Full-Stack Developer",

location: "Nigeria (Willing to Relocate & Remote)",

},

{

id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://pulamusic.github.io/images/JimHeadshot.jpg` }/>,
name:"Jim Carroll",

website: <div><a href="https://pulamusic.github.io/" target="_blank" rel="noopener noreferrer">Jim Carroll's Portfolio</a>
<br></br>
<a href="https://www.linkedin.com/in/james-carroll-36001511a/" target="_blank" rel="noopener noreferrer">Jim's LinkedIn Page</a>
</div>,
jobTitle:"Academic &amp; Front-End Developer",

location: "Springfield, MA USA",

},


{
id:"",
name:"Klaidas Vysniauskas",

website: <div><a href="https://github.com/KlaidasVysniauskas" target="_blank" rel="noopener noreferrer">Klaidas Portfolio</a>
</div>,


jobTitle:"Full-Stack Developer",

location: "Preston, UK",

},
{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`data:image/jpeg;base64,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` }/>,
name: "Louise van den Berg",

website: <div><a href="https://louisevdb.herokuapp.com" target="_blank" rel="noopener noreferrer">Louise's Portfolio</a>
<br></br>
<a href="https://www.linkedin.com/in/louise-van-den-berg-016179114/" target="_blank" rel="noopener noreferrer">Louise's LinkedIn Page</a>
</div>,
jobTitle: "Fullstack Web Developer",

location: "Johannesburg - South Africa",

},




{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C4D03AQE5FEvf75CqNA/profile-displayphoto-shrink_800_800/0?e=1528552800&v=beta&t=4bxzIqg5f8nRtPzfMlWg_YvxJFqC93lg6EeMRGZHt-0` }/>,
name: "Matthew Collier",

website: <div><a href="https://github.com/matthewcollier1/" target="_blank" rel="noopener noreferrer">GitHub</a> 
<br></br>
<a href="http://matthewcollier.ca" target="_blank" rel="noopener noreferrer">Portfolio</a>
<br></br>
<a href="https://www.linkedin.com/in/matthewjcollier/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>,
jobTitle: "Front-end Web Developer",

location: "Toronto, Canada",
},             

{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C5103AQF1djmtZya33g/profile-displayphoto-shrink_800_800/0?e=1528552800&v=beta&t=9--dS-8c87a4kSgCkKV6hEf3Q9eTSPJIlHc2sQrwsUM` }/>,
name: "Sri Harsha",

website: <div><a href="http://sriharsha.ml/" target="_blank" rel="noopener noreferrer">www.sriharsha.ml</a>
<br></br>
<a href="https://www.linkedin.com/in/harsha444" target="_blank" rel="noopener noreferrer">Sri Harsha</a>
</div>,
jobTilte:"Full Stack Developer",

location:"Durgapur,India",

},

{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C4D03AQEpXEA2S8bKjg/profile-displayphoto-shrink_800_800/0?e=1528552800&v=beta&t=-eWTij44N-3VxkLASMQPuJQaD7-udPu-vZ94zHmcldU` }/>,
name:"Yuankan Fang",

website: <div><a href="https://kyleyk.github.io/" target="_blank" rel="noopener noreferrer">Portfolio</a>
<br></br>
<a href="https://www.linkedin.com/in/yuankanf/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>,
jobTitle: "Web Developer/Software Engineer",

location: "San Diego, CA USA",

},

{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`http://jonathanitzen.com/wp-content/themes/jonathanportfolio/imgs/profile.jpg` }/>,
name: "Jonathan Itzen",

website: <div> <a href="http://jonathanitzen.com/" target="_blank" rel="noopener noreferrer">www.jonathanitzen.com</a>
<br></br>
<a href="https://www.linkedin.com/in/jonathan-itzen" target="_blank" rel="noopener noreferrer">username</a>
</div>,

jobTitle: "WordPress Developer",

location: "Fort Dodge, Iowa USA",

},

{      
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C4E03AQFG-tPI_99VdQ/profile-displayphoto-shrink_800_800/0?e=1528552800&v=beta&t=Pwh88C9Q1ZyLh-kTyVtsUSD48WM22TnxWyLu4ALDg0I` }/>,   
name: "Ryan Walker",

website:<div><a href="https://ryanwalkerdevelopment.com" target="_blank" rel="noopener noreferrer">Portfolio</a>
<br></br>
<a href="https://www.linkedin.com/in/ryan-walker-41082b47/" target="_blank" rel="noopener noreferrer">Linkedin Profile</a>
</div>,
jobTitle:"Front-end Developer",

location: "Youngstown, OH USA",
},




{    
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://avatars0.githubusercontent.com/u/25121780?s=460&v=4` }/>,
name: "Daniel Alviso",

website: <div><a href="http://dan-alviso.com" target="_blank" rel="noopener noreferrer">Portfolio Site</a> 
<br></br>
<a href="http://github.com/dan-alviso" target="_blank" rel="noopener noreferrer">GitHub</a>
<br></br>
<a href="https://www.linkedin.com/in/dan-alviso/" target="_blank" rel="noopener noreferrer">Linkedin</a>
</div>,
jobTitle: "Software Developer",

location: "San Francisco Bay Area, CA USA",

},



{
id: <img className="br-100 pa1 ba b--black h4 w4" alt='robots' src={`https://media.licdn.com/dms/image/C4E03AQFJo9NvT8gtAg/profile-displayphoto-shrink_800_800/0?e=1528549200&v=beta&t=DRZ5Q1-o5SWRSH3j-W8dHwfM6UlWCr813IsLSGuAVaQ` }/>,

name: "Osei Kofi Nimoh",

website: <div> <a href="http://vitusbtravelntour" target="_blank" rel="noopener noreferrer">Portfolio Site</a> 
<br></br>
<a href="https://www.linkedin.com/in/kofi-osei-nimoh-15148a73/" target="_blank" rel="noopener noreferrer">Linkedin</a>
</div>,

jobTitle: "Web Developer",

location: "Accra, Ghana",
},

];