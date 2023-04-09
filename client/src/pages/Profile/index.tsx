import { BaseSyntheticEvent, useEffect, useState } from "react";
import {
  InputGroup,
  Input,
  InputRightElement,
  Button,
  VStack,
  Text,
  Heading,
  Flex,
  useToast,
  Link,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  Skeleton,
  ListItem,
  UnorderedList,
  Box,
  Stack,
  StackDivider,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const Links = ["Register", "Login", "Profile", "Search"];

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    as={RouterLink}
    to={"/" + children.toLowerCase()}
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
  >
    {children}
  </Link>
);

const Profile = (): React.ReactElement => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [deviceBackground, setDeviceBackground] = useState("Windows");
  const [reviews, setReviews] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const toast = useToast();

  const handleUsernameChange = (event: BaseSyntheticEvent) => {
    if (event.target.value === "") {
      setUsernameError(true);
    } else {
      setUsername(event.target.value);
      setUsernameError(false);
    }
  };

  const handlePasswordChange = (event: BaseSyntheticEvent) => {
    if (event.target.value === "") {
      setPasswordError(true);
    } else {
      setPassword(event.target.value);
      setPasswordError(false);
    }
  };

  const handleEmailChange = (event: BaseSyntheticEvent) => {
    if (event.target.value === "") {
      setEmailError(true);
    } else {
      setEmail(event.target.value);
      setEmailError(false);
    }
  };

  const handlePasswordClick = () => setShowPassword(!showPassword);

  const handleSubmit = (): void => {
    if (!usernameError && !passwordError && !emailError) {
      fetch("/api/profile", {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + localStorage.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
          device_background: deviceBackground,
        }),
      })
        .then((response) => {
          if (response.status === 200) {
            toast({
              title: "Update successful",
              status: "success",
              position: "top",
              duration: 5000,
            });

            return response.json();
          } else {
            toast({
              title: "Update failed",
              status: "error",
              position: "top",
              duration: 5000,
            });
          }
        })
        .then((json) => {
          setUsername(json["user"]["username"]);
          setPassword(json["user"]["password"]);
          setEmail(json["user"]["email"]);
          setDeviceBackground(json["user"]["deviceBackground"]);
          localStorage.token = json.access_token;
        });
    }
  };

  const handleDelete = (id: string): void => {
    fetch("/api/review/" + id, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.token,
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 200) {
        toast({
          title: "Review deleted",
          status: "success",
          position: "top",
          duration: 5000,
        });

        fetch("/api/review", {
          headers: {
            Authorization: "Bearer " + localStorage.token,
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (response.status === 200) {
              return response.json();
            } else {
              toast({
                title: "Get review failed",
                status: "error",
                position: "top",
                duration: 5000,
              });
            }
          })
          .then((json) => {
            setReviews(json["reviews"]);
          });
      } else {
        toast({
          title: "Review delete failed",
          status: "error",
          position: "top",
          duration: 5000,
        });
      }
    });
  };

  useEffect(() => {
    fetch("/api/profile", {
      headers: {
        Authorization: "Bearer " + localStorage.token,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          toast({
            title: "Get profile failed",
            status: "error",
            position: "top",
            duration: 5000,
          });
        }
      })
      .then((json) => {
        setUsername(json["user"]["username"]);
        setPassword(json["user"]["password"]);
        setEmail(json["user"]["email"]);
        setDeviceBackground(json["user"]["device_background"]);
        setIsLoading(false);
      });

    fetch("/api/review", {
      headers: {
        Authorization: "Bearer " + localStorage.token,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          toast({
            title: "Get review failed",
            status: "error",
            position: "top",
            duration: 5000,
          });
        }
      })
      .then((json) => {
        setReviews(json["reviews"]);
      });
  }, []);

  return (
    <Box>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <HStack spacing={8} alignItems={"center"}>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>
        </Flex>
      </Box>
      <Flex minH={"90vh"} align={"center"} justify={"center"}>
        <VStack
          align="unset"
          spacing="5"
          p="5"
          border="1px"
          borderColor="gray.100"
          minWidth={"50vw"}
        >
          <Heading size="lg">Profile</Heading>

          <Skeleton isLoaded={!isLoading}>
            <FormControl isInvalid={emailError}>
              <FormLabel>Email</FormLabel>
              <Input type="email" onChange={handleEmailChange} value={email} />
              <FormErrorMessage>Email is required.</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={usernameError}>
              <FormLabel>Username</FormLabel>
              <Input onChange={handleUsernameChange} value={username} />
              <FormErrorMessage>Username is required.</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={passwordError}>
              <FormLabel>Password</FormLabel>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  type={showPassword ? "text" : "password"}
                  onChange={handlePasswordChange}
                  value={password}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handlePasswordClick}>
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>Password is required.</FormErrorMessage>
            </FormControl>

            <FormControl as="fieldset">
              <FormLabel as="legend">Device Platform</FormLabel>
              <RadioGroup
                defaultValue={deviceBackground}
                onChange={setDeviceBackground}
              >
                <HStack spacing="24px">
                  <Radio value="Windows">Windows</Radio>
                  <Radio value="Mac">Mac</Radio>
                  <Radio value="Linux">Linux</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
          </Skeleton>
          <Button onClick={handleSubmit}>Update</Button>

          <Text fontSize="lg">Reviews</Text>
          <Stack
            divider={<StackDivider />}
            border="1px"
            borderColor="gray.100"
            borderRadius="10"
          >
            {reviews.length &&
              reviews.map((item: string) => {
                return (
                  <HStack justify="space-between" p="5">
                    <Box>
                      {item["rating"]} - {item["content"]}
                    </Box>
                    <Button
                      colorScheme="red"
                      onClick={handleDelete.bind(this, item["id"])}
                    >
                      Delete
                    </Button>
                  </HStack>
                );
              })}
          </Stack>
        </VStack>
      </Flex>
    </Box>
  );
};

export default Profile;
